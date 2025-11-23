import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Scale,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  MessageSquare,
  Database
} from "@/icons";

export default function Landing() {
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" strokeWidth={0.5} />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SwiftFill
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Legal Form Filling
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
          Fill California Court Forms{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            10x Faster
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          SwiftFill helps self-represented litigants complete complex legal forms with
          AI assistance, smart autofill, and step-by-step guidance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start Filling Forms Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="gap-2">
            Watch Demo
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            500+ forms completed
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            California Judicial Council forms
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Free to start
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to File with Confidence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for self-represented litigants
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get instant help understanding legal terms and filling out complex fields
                with our AI-powered assistant.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Personal Data Vault</h3>
              <p className="text-sm text-muted-foreground">
                Enter your information once and autofill it across all your forms.
                Your data stays encrypted and private.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multi-Form Packets</h3>
              <p className="text-sm text-muted-foreground">
                Complete entire TRO packets with guided workflows that automatically
                map data between related forms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Auto-Save</h3>
              <p className="text-sm text-muted-foreground">
                Never lose your progress. Your work is automatically saved every
                few seconds with offline support.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground">
                AES-256 encryption protects sensitive information. Your data is
                never shared or used for training.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Keyboard-First Design</h3>
              <p className="text-sm text-muted-foreground">
                Navigate through forms with just Tab and Enter. Designed for
                speed and accessibility.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Supported Forms */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Supported California Judicial Council Forms</h2>
          <p className="text-muted-foreground">
            Currently supporting domestic violence restraining order forms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { id: "DV-100", name: "Request for DVRO", pages: 13 },
            { id: "DV-105", name: "Child Custody Orders", pages: 6 },
            { id: "DV-109", name: "Notice of Hearing", pages: 2 },
            { id: "DV-110", name: "TRO", pages: 7 },
            { id: "FL-320", name: "Response to RO", pages: 4 },
            { id: "CLETS-001", name: "Law Enforcement Info", pages: 2 },
          ].map((form) => (
            <div
              key={form.id}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="font-mono text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                {form.id}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{form.name}</div>
                <div className="text-xs text-muted-foreground">{form.pages} pages</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of self-represented litigants who are filling court forms
            faster and with more confidence.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-muted-foreground" strokeWidth={0.5} />
              <span className="text-sm text-muted-foreground">
                SwiftFill - AI-Powered Legal Form Filling
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Not legal advice. For informational purposes only.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
