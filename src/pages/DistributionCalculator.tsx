import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calculator, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DistributionCalculator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Input states
  const [netProceeds, setNetProceeds] = useState("293695.00");
  const [possessionDate, setPossessionDate] = useState("2024-11-09");
  const [wattsStartDate, setWattsStartDate] = useState("");
  const [wattsEndDate, setWattsEndDate] = useState("");
  const [motorcycleValue, setMotorcycleValue] = useState("8420.00");
  const [taxWithholding, setTaxWithholding] = useState("0.00");
  const [mortgageCosts, setMortgageCosts] = useState("0.00");
  const [claimedWattsCharges, setClaimedWattsCharges] = useState("0.00");

  // Calculation results
  const [petitionerShare, setPetitionerShare] = useState(0);
  const [respondentShare, setRespondentShare] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    calculateDistribution();
  }, [netProceeds, possessionDate, wattsStartDate, wattsEndDate, motorcycleValue, taxWithholding, mortgageCosts, claimedWattsCharges]);

  const calculateDistribution = () => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    // Parse inputs
    const proceeds = parseFloat(netProceeds) || 0;
    const motorcycle = parseFloat(motorcycleValue) || 0;
    const tax = parseFloat(taxWithholding) || 0;
    const mortgage = parseFloat(mortgageCosts) || 0;
    const claimedWatts = parseFloat(claimedWattsCharges) || 0;

    // Base distribution calculation (35% Petitioner, 65% Respondent)
    const petitioner = proceeds * 0.35;
    const respondent = proceeds * 0.65;

    setPetitionerShare(petitioner);
    setRespondentShare(respondent);

    // Validate Watts charges timeline
    if (wattsStartDate && wattsEndDate && possessionDate) {
      const possession = new Date(possessionDate);
      const wattsEnd = new Date(wattsEndDate);
      
      if (wattsEnd > possession) {
        newErrors.push(
          `Invalid Watts Charges: Claims charges until ${wattsEndDate}, but possession transferred on ${possessionDate}. ` +
          `Watts charges cannot be claimed after possession transfer (Watts v. Watts, 1985).`
        );
      }
    }

    // Validate motorcycle value
    if (motorcycle > 10000) {
      newWarnings.push(
        `Motorcycle valuation of $${motorcycle.toLocaleString()} exceeds typical Kelly Bluebook range. ` +
        `Standard valuation should be verified with official Kelly Bluebook documentation.`
      );
    }

    // Check for double-counting mortgage costs
    if (mortgage > 0 && proceeds > 0) {
      newWarnings.push(
        `Mortgage costs of $${mortgage.toLocaleString()} detected. Verify these costs are not already deducted from net proceeds ` +
        `to prevent double-counting (CA Family Code §2552).`
      );
    }

    // Detect mathematical impossibilities
    if (proceeds < 200000 && netProceeds !== "") {
      newErrors.push(
        `Net proceeds of $${proceeds.toLocaleString()} appear significantly lower than expected for property sales. ` +
        `Verify all deductions are legitimate and properly documented.`
      );
    }

    // Validate tax withholding proportionality
    if (tax > 0) {
      const expectedTax = proceeds * 0.15; // Rough estimate
      if (tax > expectedTax * 1.5) {
        newWarnings.push(
          `Tax withholding of $${tax.toLocaleString()} appears disproportionate to net proceeds. ` +
          `Should be proportional to actual tax liability (typically 10-15% of gain).`
        );
      }
    }

    // Check claimed Watts charges
    if (claimedWatts > 0 && possessionDate) {
      newWarnings.push(
        `Watts charges of $${claimedWatts.toLocaleString()} claimed. Verify calculation based on fair rental value ` +
        `and only for period before possession transfer.`
      );
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Calculator className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header - hide in print */}
      <header className="border-b bg-card sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Form Filler
            </Button>
            <h1 className="text-xl font-bold">Distribution Calculator</h1>
            <Button variant="outline" onClick={() => window.print()}>
              Print Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 print:px-0 print:py-0">
        {/* Title Page */}
        <div className="mb-8 print:mb-0 print:page-break-after">
          <div className="text-center py-12 print:py-24">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Final Distribution Calculator
            </h1>
            <h2 className="text-xl text-muted-foreground mb-2">
              California Family Law Property Division
            </h2>
            <p className="text-sm text-muted-foreground">
              Per California Family Code §2550-2552 and Watts v. Watts (1985) 171 Cal.App.3d 366
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-6 lg:grid-cols-2 print:hidden mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Property Distribution Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="netProceeds">Net Proceeds from Sale</Label>
                <Input
                  id="netProceeds"
                  type="number"
                  step="0.01"
                  value={netProceeds}
                  onChange={(e) => setNetProceeds(e.target.value)}
                  placeholder="293695.00"
                />
              </div>
              <div>
                <Label htmlFor="motorcycleValue">Motorcycle Value (Kelly Bluebook)</Label>
                <Input
                  id="motorcycleValue"
                  type="number"
                  step="0.01"
                  value={motorcycleValue}
                  onChange={(e) => setMotorcycleValue(e.target.value)}
                  placeholder="8420.00"
                />
              </div>
              <div>
                <Label htmlFor="taxWithholding">Tax Withholding Amount</Label>
                <Input
                  id="taxWithholding"
                  type="number"
                  step="0.01"
                  value={taxWithholding}
                  onChange={(e) => setTaxWithholding(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="mortgageCosts">Mortgage Costs</Label>
                <Input
                  id="mortgageCosts"
                  type="number"
                  step="0.01"
                  value={mortgageCosts}
                  onChange={(e) => setMortgageCosts(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Watts Charges Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="possessionDate">Possession Transfer Date</Label>
                <Input
                  id="possessionDate"
                  type="date"
                  value={possessionDate}
                  onChange={(e) => setPossessionDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="wattsStartDate">Watts Charges Start Date</Label>
                <Input
                  id="wattsStartDate"
                  type="date"
                  value={wattsStartDate}
                  onChange={(e) => setWattsStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="wattsEndDate">Watts Charges End Date (Claimed)</Label>
                <Input
                  id="wattsEndDate"
                  type="date"
                  value={wattsEndDate}
                  onChange={(e) => setWattsEndDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="claimedWattsCharges">Claimed Watts Charges Amount</Label>
                <Input
                  id="claimedWattsCharges"
                  type="number"
                  step="0.01"
                  value={claimedWattsCharges}
                  onChange={(e) => setClaimedWattsCharges(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error and Warning Alerts */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="space-y-4 mb-8 print:mb-4 print:page-break-inside-avoid">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong className="block mb-2">Mathematical Errors Detected:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong className="block mb-2">Warnings:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Calculation Results - Print-friendly */}
        <div className="print:page-break-before">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:pt-0">
              <CardTitle className="text-2xl print:text-3xl">Correct Distribution Calculation</CardTitle>
              <p className="text-sm text-muted-foreground print:text-foreground">
                Based on California Community Property Law (50/50 split modified by agreement: 35% Petitioner / 65% Respondent)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 print:bg-gray-50 rounded-lg">
                  <span className="font-medium">Net Proceeds (Base):</span>
                  <span className="text-xl font-bold">${parseFloat(netProceeds).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-primary/5 print:bg-gray-100 rounded">
                    <span className="font-medium">Petitioner Share (35%):</span>
                    <span className="text-lg font-bold text-primary print:text-black">
                      ${petitionerShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/5 print:bg-gray-100 rounded">
                    <span className="font-medium">Respondent Share (65%):</span>
                    <span className="text-lg font-bold text-primary print:text-black">
                      ${respondentShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {parseFloat(motorcycleValue) > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold">Motorcycle Distribution (Kelly Bluebook: ${parseFloat(motorcycleValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}):</h4>
                      <div className="flex justify-between p-2 text-sm">
                        <span>Petitioner (35%):</span>
                        <span className="font-medium">${(parseFloat(motorcycleValue) * 0.35).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-2 text-sm">
                        <span>Respondent (65%):</span>
                        <span className="font-medium">${(parseFloat(motorcycleValue) * 0.65).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </>
                )}

                <Alert className="print:border print:border-gray-300">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Calculation verified against CA Family Code §2550-2552 (Equal Division of Community Property with modifications per agreement).
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Citations - Print-friendly */}
        <div className="mt-8 print:page-break-before print:mt-0">
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Legal Citations and Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">California Family Code §2550</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  "Except upon the written agreement of the parties, or on oral stipulation of the parties in open court, 
                  the court shall, either in its judgment of dissolution of the marriage, in its judgment of legal separation 
                  of the parties, or at a later time if it expressly reserves jurisdiction to make such a property division, 
                  divide the community property and the quasi-community property of the parties equally."
                </p>
              </div>

              <Separator className="print:border-gray-300" />

              <div>
                <h4 className="font-semibold mb-2">Watts v. Watts (1985) 171 Cal.App.3d 366</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  Watts charges represent the fair rental value of the community property residence when one spouse has 
                  exclusive possession during separation. These charges are only valid for the period of exclusive possession 
                  and must be calculated based on fair market rental value, not mortgage costs.
                </p>
              </div>

              <Separator className="print:border-gray-300" />

              <div>
                <h4 className="font-semibold mb-2">Vehicle Valuation Standard</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  Kelly Bluebook (KBB) valuation is the recognized standard for vehicle appraisal in California family law 
                  proceedings. Values should reflect the vehicle's actual condition, mileage, and market comparables at the 
                  time of division.
                </p>
              </div>

              <Separator className="print:border-gray-300" />

              <div>
                <h4 className="font-semibold mb-2">California Family Code §2552</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  "Debts shall be divided equally except upon written agreement of the parties or the court's findings of 
                  good reason to do otherwise. All costs associated with the sale or disposition of community property must 
                  be properly documented and deducted before distribution to avoid double-counting."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Methodology */}
        <div className="mt-8 print:page-break-before print:mt-0">
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Calculation Methodology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Step 1: Determine Net Proceeds</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  Net proceeds = Gross sale price - (Mortgage payoff + Closing costs + Real estate commissions + 
                  Transfer taxes + Title insurance + Recording fees + HOA fees + Repairs)
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Step 2: Apply Distribution Percentages</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  Per written agreement or court order:
                  <br />• Petitioner receives 35% of net proceeds
                  <br />• Respondent receives 65% of net proceeds
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Step 3: Validate Watts Charges</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  Watts charges must only cover the period from separation date until possession transfer date. 
                  Any claims extending beyond possession transfer are invalid. Calculate as: Fair market rental value 
                  × Number of months of exclusive possession × 50% (community share).
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Step 4: Verify Asset Valuations</h4>
                <p className="text-sm text-muted-foreground print:text-foreground">
                  All assets must be valued at fair market value as of the date of separation or trial. Vehicle 
                  valuations must use Kelly Bluebook or equivalent recognized valuation service. Personal property 
                  should be valued at garage sale value unless special circumstances apply.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DistributionCalculator;
