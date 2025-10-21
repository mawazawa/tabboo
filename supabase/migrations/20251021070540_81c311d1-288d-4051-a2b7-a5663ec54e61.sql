-- Fix SECURITY DEFINER functions to have fixed search_path
-- This prevents privilege escalation attacks via schema injection

-- 1. add_credits function (UUID version)
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_credits_to_add integer, p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_batch_id UUID;
  v_new_balance INTEGER;
BEGIN
  INSERT INTO user_credits (
    user_id,
    fingerprint,
    credits_balance,
    credits_purchased,
    total_credits_purchased,
    stripe_customer_id,
    last_purchase_at
  )
  VALUES (
    p_user_id::TEXT,
    p_user_id::TEXT,
    p_credits_to_add,
    p_credits_to_add,
    p_credits_to_add,
    NULL,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    credits_balance = user_credits.credits_balance + p_credits_to_add,
    credits_purchased = user_credits.credits_purchased + p_credits_to_add,
    total_credits_purchased = user_credits.total_credits_purchased + p_credits_to_add,
    last_purchase_at = NOW(),
    updated_at = NOW()
  RETURNING credits_balance INTO v_new_balance;

  INSERT INTO credit_batches (
    user_id,
    purchase_date,
    expiration_date,
    credits_purchased,
    credits_remaining,
    transaction_id
  ) VALUES (
    p_user_id,
    NOW(),
    NOW() + INTERVAL '365 days',
    p_credits_to_add,
    p_credits_to_add,
    p_transaction_id
  ) RETURNING id INTO v_batch_id;

  RETURN jsonb_build_object(
    'new_balance', v_new_balance,
    'batch_id', v_batch_id
  );
END;
$function$;

-- 2. deduct_credit function
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_batch_id UUID;
  v_remaining INTEGER;
BEGIN
  SELECT id, credits_remaining INTO v_batch_id, v_remaining
  FROM credit_batches
  WHERE user_id = p_user_id
    AND credits_remaining > 0
  ORDER BY purchase_date ASC
  LIMIT 1;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'No credits available';
  END IF;

  UPDATE credit_batches
  SET credits_remaining = credits_remaining - 1
  WHERE id = v_batch_id;

  UPDATE user_credits
  SET
    credits_balance = credits_balance - 1,
    credits_used = credits_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id::TEXT;

  RETURN jsonb_build_object(
    'batch_id', v_batch_id,
    'remaining_in_batch', v_remaining - 1
  );
END;
$function$;

-- 3. process_refund function
CREATE OR REPLACE FUNCTION public.process_refund(p_transaction_id uuid, p_stripe_refund_id text, p_amount_refunded integer, p_currency text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id UUID;
  v_credits_deducted INTEGER := 10;
  v_new_balance INTEGER;
BEGIN
  SELECT user_id INTO v_user_id
  FROM payment_transactions
  WHERE id = p_transaction_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_transaction_id;
  END IF;

  UPDATE payment_transactions
  SET status = 'refunded', updated_at = NOW()
  WHERE id = p_transaction_id;

  UPDATE user_credits
  SET
    credits_balance = credits_balance - v_credits_deducted,
    updated_at = NOW()
  WHERE user_id = v_user_id::TEXT
  RETURNING credits_balance INTO v_new_balance;

  INSERT INTO payment_refunds (
    transaction_id,
    stripe_refund_id,
    amount_refunded,
    currency,
    credits_deducted
  ) VALUES (
    p_transaction_id,
    p_stripe_refund_id,
    p_amount_refunded,
    p_currency,
    v_credits_deducted
  );

  RETURN jsonb_build_object(
    'new_balance', v_new_balance,
    'credits_deducted', v_credits_deducted,
    'user_id', v_user_id
  );
END;
$function$;

-- 4. expire_credits function
CREATE OR REPLACE FUNCTION public.expire_credits()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_expired_count INTEGER;
  v_total_credits_expired INTEGER := 0;
  v_affected_batches RECORD;
BEGIN
  FOR v_affected_batches IN
    SELECT user_id, SUM(credits_remaining) AS total_expired
    FROM credit_batches
    WHERE expiration_date <= NOW()
      AND credits_remaining > 0
    GROUP BY user_id
  LOOP
    UPDATE credit_batches
    SET credits_remaining = 0
    WHERE user_id = v_affected_batches.user_id
      AND expiration_date <= NOW()
      AND credits_remaining > 0;

    UPDATE user_credits
    SET
      credits_balance = credits_balance - v_affected_batches.total_expired,
      credits_expired = credits_expired + v_affected_batches.total_expired,
      updated_at = NOW()
    WHERE user_id = v_affected_batches.user_id::TEXT;

    v_total_credits_expired := v_total_credits_expired + v_affected_batches.total_expired;
    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'users_affected', COALESCE(v_expired_count, 0),
    'total_credits_expired', v_total_credits_expired
  );
END;
$function$;

-- 5. create_document_version trigger function
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO document_versions (
      document_id,
      version_number,
      content_snapshot,
      change_summary
    )
    VALUES (
      NEW.id,
      COALESCE((
        SELECT MAX(version_number) + 1
        FROM document_versions
        WHERE document_id = NEW.id
      ), 1),
      NEW.content,
      'Auto-saved'
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 6. check_quota function
CREATE OR REPLACE FUNCTION public.check_quota(user_fingerprint text)
RETURNS TABLE(remaining integer, limit_value integer, requires_upgrade boolean, upgrade_url text, last_restore_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  quota_record user_quota%ROWTYPE;
  remaining_count INTEGER;
BEGIN
  DECLARE
    free_tier_limit CONSTANT INTEGER := 1;
  BEGIN
    INSERT INTO user_quota (fingerprint, restore_count, last_restore_at)
    VALUES (user_fingerprint, 0, NULL)
    ON CONFLICT (fingerprint) DO NOTHING;

    SELECT * INTO quota_record
    FROM user_quota
    WHERE fingerprint = user_fingerprint;

    remaining_count := GREATEST(0, free_tier_limit - quota_record.restore_count);

    RETURN QUERY SELECT
      remaining_count AS remaining,
      free_tier_limit AS limit_value,
      (remaining_count = 0) AS requires_upgrade,
      CASE
        WHEN remaining_count = 0 THEN 'https://retrophoto.app/upgrade'::TEXT
        ELSE NULL::TEXT
      END AS upgrade_url,
      quota_record.last_restore_at;
  END;
END;
$function$;

-- 7. cleanup_expired_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS TABLE(deleted_count integer, cleanup_timestamp timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_sessions INTEGER;
BEGIN
  DELETE FROM upload_sessions
  WHERE ttl_expires_at < NOW();

  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;

  RETURN QUERY SELECT
    deleted_sessions AS deleted_count,
    NOW() AS cleanup_timestamp;
END;
$function$;

-- 8. search_document_vault function
CREATE OR REPLACE FUNCTION public.search_document_vault(query_embedding vector, user_id_param text, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10)
RETURNS TABLE(id uuid, original_filename text, extracted_text text, similarity double precision)
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    dvi.id,
    dvi.original_filename,
    dvi.extracted_text,
    1 - (dvi.embedding <=> query_embedding) AS similarity
  FROM document_vault_items dvi
  WHERE
    dvi.user_id = user_id_param
    AND dvi.embedding IS NOT NULL
    AND 1 - (dvi.embedding <=> query_embedding) > match_threshold
  ORDER BY dvi.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- 9. set_refund_eligible_until trigger function
CREATE OR REPLACE FUNCTION public.set_refund_eligible_until()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.refund_eligible_until = NEW.subscription_started_at + INTERVAL '7 days';
  RETURN NEW;
END;
$function$;

-- 10. update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix user_quota table RLS - restrict public access to only user's own data
DROP POLICY IF EXISTS "user_quota_select_public" ON user_quota;

-- Users can only view their own quota by fingerprint
CREATE POLICY "Users can view own quota"
ON user_quota FOR SELECT
TO authenticated
USING (
  fingerprint = (auth.uid())::text OR
  fingerprint = ((current_setting('request.headers'::text, true))::json ->> 'x-user-fingerprint'::text)
);

-- Service role can view all quotas
CREATE POLICY "Service can view all quotas"
ON user_quota FOR SELECT
TO service_role
USING (true);