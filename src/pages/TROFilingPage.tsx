/**
 * TRO Filing Page
 *
 * Main entry point for users filing Temporary Restraining Orders.
 * Provides a guided, user-friendly flow from start to finish.
 *
 * "Tab, tab, tab" - Everything should be a sigh of relief.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TROWorkflowWizard } from '@/components/TROWorkflowWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Clock, CheckCircle, ArrowRight } from '@/icons';

export default function TROFilingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id });
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleComplete = () => {
    // Navigate to success/download page
    navigate('/dashboard');
  };

  const handleError = (error: Error) => {
    console.error('Workflow error:', error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - show landing
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              File for Protection
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get a Temporary Restraining Order in Los Angeles County.
              We'll guide you through every step.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">All Forms Included</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  DV-100, CLETS-001, DV-109, DV-110 and all required forms auto-generated
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Save Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fill once, populate everywhere. Your info flows to all forms automatically
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Court-Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Forms meet all LA Superior Court requirements for filing
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-sm text-slate-500">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show wizard selection or wizard
  if (!showWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              What type of protection do you need?
            </h1>
            <p className="text-slate-600">
              Select the option that best describes your situation
            </p>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              onClick={() => setShowWizard(true)}
            >
              <CardHeader>
                <CardTitle>Domestic Violence Restraining Order</CardTitle>
                <CardDescription>
                  Protection from abuse by a family member, intimate partner, or household member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Spouse, ex-spouse, or dating partner</li>
                  <li>• Parent of your child</li>
                  <li>• Family member or relative</li>
                  <li>• Someone you live(d) with</li>
                </ul>
                <Button className="w-full mt-4">
                  Start DVRO <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <CardTitle>Civil Harassment Restraining Order</CardTitle>
                <CardDescription>
                  Protection from harassment by neighbors, coworkers, or others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Neighbor or roommate</li>
                  <li>• Coworker (non-workplace violence)</li>
                  <li>• Acquaintance or stranger</li>
                  <li>• Anyone not in DV category</li>
                </ul>
                <Button className="w-full mt-4" disabled variant="outline">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show the wizard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <TROWorkflowWizard
          userId={user.id}
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>
    </div>
  );
}
