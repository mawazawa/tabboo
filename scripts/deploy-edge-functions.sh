#!/bin/bash
# Deploy all Supabase Edge Functions
# Usage: ./scripts/deploy-edge-functions.sh

set -e

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# List of all edge functions to deploy
FUNCTIONS=(
  "ai-form-assistant"
  "clarification-api"
  "create-test-user"
  "get-knowledge-graph"
  "groq-chat"
  "plaid-balances"
  "plaid-exchange-token"
  "plaid-liabilities"
  "plaid-link-token"
  "plaid-transactions-sync"
  "process-extraction"
  "upload-document-secure"
)

# Track results
DEPLOYED=0
FAILED=0
FAILED_FUNCTIONS=""

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
  echo "📦 Deploying: $func"

  if npx supabase functions deploy "$func" --no-verify-jwt 2>&1; then
    echo "   ✅ Success"
    ((DEPLOYED++))
  else
    echo "   ❌ Failed"
    ((FAILED++))
    FAILED_FUNCTIONS="$FAILED_FUNCTIONS $func"
  fi

  echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✅ Deployed: $DEPLOYED"
echo "   ❌ Failed: $FAILED"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "   Failed functions:$FAILED_FUNCTIONS"
  echo ""
  echo "⚠️  Some functions failed to deploy!"
  exit 1
else
  echo ""
  echo "🎉 All functions deployed successfully!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Set required secrets:"
echo "   npx supabase secrets set GROQ_API_KEY=your_key"
echo "   npx supabase secrets set MISTRAL_API_KEY=your_key"
echo "   npx supabase secrets set GEMINI_API_KEY=your_key"
echo "   npx supabase secrets set PLAID_CLIENT_ID=your_id"
echo "   npx supabase secrets set PLAID_SECRET=your_secret"
echo ""
echo "2. Verify functions are live:"
echo "   curl https://your-project.supabase.co/functions/v1/groq-chat"
echo ""
