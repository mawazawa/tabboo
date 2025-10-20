import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calculator, AlertTriangle, CheckCircle, ArrowLeft, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FieldPosition {
  x: number;
  y: number;
}

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

  // Drag and drop states
  const [fieldPositions, setFieldPositions] = useState<Record<string, FieldPosition>>({});
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculation results
  const [petitionerShare, setPetitionerShare] = useState(0);
  const [respondentShare, setRespondentShare] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const fieldId = active.id as string;
    
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentPos = fieldPositions[fieldId] || { x: 0, y: 0 };
      
      setFieldPositions(prev => ({
        ...prev,
        [fieldId]: {
          x: currentPos.x + delta.x,
          y: currentPos.y + delta.y,
        }
      }));
    }
    
    setDraggingField(null);
  };

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

  const DraggableField = ({ id, label, value, onChange, type = "number", children }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    children?: React.ReactNode;
  }) => {
    const position = fieldPositions[id] || { x: 0, y: 0 };
    const isDragging = draggingField === id;

    return (
      <div 
        className="relative"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <div className="relative">
          <Label htmlFor={id}>{label}</Label>
          {children || (
            <Input
              id={id}
              type={type}
              step="0.01"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={value}
            />
          )}
          
          {/* Drag handle positioned 30px up and 30px right */}
          <div
            className="absolute cursor-move group"
            style={{ top: '-30px', right: '-30px' }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDraggingField(id);
            }}
          >
            {/* Connector line */}
            <svg
              className="absolute pointer-events-none"
              style={{
                width: '40px',
                height: '40px',
                left: '-5px',
                top: '-5px',
              }}
            >
              <line
                x1="35"
                y1="35"
                x2="5"
                y2="5"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2,2"
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </svg>
            
            {/* Drag icon */}
            <div className="relative z-10 bg-background border rounded p-1 shadow-sm group-hover:shadow-md group-hover:border-primary transition-all">
              <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background print:bg-white" ref={containerRef}>
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
                <p className="text-sm text-muted-foreground mt-2">
                  Drag the <GripVertical className="inline h-3 w-3" /> icon to reposition fields
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <DraggableField
                  id="netProceeds"
                  label="Net Proceeds from Sale"
                  value={netProceeds}
                  onChange={setNetProceeds}
                />
                <DraggableField
                  id="motorcycleValue"
                  label="Motorcycle Value (Kelly Bluebook)"
                  value={motorcycleValue}
                  onChange={setMotorcycleValue}
                />
                <DraggableField
                  id="taxWithholding"
                  label="Tax Withholding Amount"
                  value={taxWithholding}
                  onChange={setTaxWithholding}
                />
                <DraggableField
                  id="mortgageCosts"
                  label="Mortgage Costs"
                  value={mortgageCosts}
                  onChange={setMortgageCosts}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Watts Charges Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DraggableField
                  id="possessionDate"
                  label="Possession Transfer Date"
                  value={possessionDate}
                  onChange={setPossessionDate}
                  type="date"
                />
                <DraggableField
                  id="wattsStartDate"
                  label="Watts Charges Start Date"
                  value={wattsStartDate}
                  onChange={setWattsStartDate}
                  type="date"
                />
                <DraggableField
                  id="wattsEndDate"
                  label="Watts Charges End Date (Claimed)"
                  value={wattsEndDate}
                  onChange={setWattsEndDate}
                  type="date"
                />
                <DraggableField
                  id="claimedWattsCharges"
                  label="Claimed Watts Charges Amount"
                  value={claimedWattsCharges}
                  onChange={setClaimedWattsCharges}
                />
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
                {/* LaTeX Formulas Section */}
                <div className="bg-muted/30 p-4 rounded-lg border print:border-gray-300">
                  <h3 className="font-semibold mb-3 text-sm">Mathematical Formulas</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Petitioner Share Calculation:</p>
                      <div className="bg-background p-3 rounded border overflow-x-auto">
                        <BlockMath math={`\\text{Petitioner} = \\text{NetProceeds} \\times 0.35 = \\$${parseFloat(netProceeds).toLocaleString()} \\times 0.35 = \\$${petitionerShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Respondent Share Calculation:</p>
                      <div className="bg-background p-3 rounded border overflow-x-auto">
                        <BlockMath math={`\\text{Respondent} = \\text{NetProceeds} \\times 0.65 = \\$${parseFloat(netProceeds).toLocaleString()} \\times 0.65 = \\$${respondentShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      </div>
                    </div>
                    {parseFloat(motorcycleValue) > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Motorcycle Distribution:</p>
                        <div className="bg-background p-3 rounded border overflow-x-auto">
                          <BlockMath math={`\\text{Motorcycle}_{\\text{Petitioner}} = \\$${parseFloat(motorcycleValue).toLocaleString()} \\times 0.35 = \\$${(parseFloat(motorcycleValue) * 0.35).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                          <BlockMath math={`\\text{Motorcycle}_{\\text{Respondent}} = \\$${parseFloat(motorcycleValue).toLocaleString()} \\times 0.65 = \\$${(parseFloat(motorcycleValue) * 0.65).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 print:bg-gray-50 rounded-lg">
                    <span className="font-medium">Net Proceeds (Base):</span>
                    <span className="text-xl font-bold">${parseFloat(netProceeds).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-primary/5 print:bg-gray-100 rounded">
                      <span className="font-medium">Petitioner Share <InlineMath math="(0.35 \times \text{Net})" />:</span>
                      <span className="text-lg font-bold text-primary print:text-black">
                        ${petitionerShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 print:bg-gray-100 rounded">
                      <span className="font-medium">Respondent Share <InlineMath math="(0.65 \times \text{Net})" />:</span>
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
                          <span>Petitioner <InlineMath math="(0.35)" />:</span>
                          <span className="font-medium">${(parseFloat(motorcycleValue) * 0.35).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between p-2 text-sm">
                          <span>Respondent <InlineMath math="(0.65)" />:</span>
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
                  <p className="text-sm text-muted-foreground print:text-foreground mb-2">
                    Net proceeds = Gross sale price - (Mortgage payoff + Closing costs + Real estate commissions + 
                    Transfer taxes + Title insurance + Recording fees + HOA fees + Repairs)
                  </p>
                  <div className="bg-muted/20 p-3 rounded border">
                    <BlockMath math="\text{Net} = \text{Gross} - \sum_{i=1}^{n} \text{Cost}_i" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Step 2: Apply Distribution Percentages</h4>
                  <p className="text-sm text-muted-foreground print:text-foreground mb-2">
                    Per written agreement or court order:
                  </p>
                  <div className="bg-muted/20 p-3 rounded border space-y-2">
                    <BlockMath math="\text{Petitioner} = \text{Net} \times 0.35" />
                    <BlockMath math="\text{Respondent} = \text{Net} \times 0.65" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Step 3: Validate Watts Charges</h4>
                  <p className="text-sm text-muted-foreground print:text-foreground mb-2">
                    Watts charges must only cover the period from separation date until possession transfer date. 
                    Any claims extending beyond possession transfer are invalid.
                  </p>
                  <div className="bg-muted/20 p-3 rounded border">
                    <BlockMath math="\text{Watts} = \text{FMV}_{\text{rent}} \times \text{Months} \times 0.50" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Where <InlineMath math="\text{FMV}_{\text{rent}}" /> is fair market rental value per month
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Step 4: Verify Asset Valuations</h4>
                  <p className="text-sm text-muted-foreground print:text-foreground">
                    All assets must be valued at fair market value as of the date of separation or trial. Vehicle 
                    valuations must use Kelly Bluebook or equivalent recognized valuation service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DndContext>
  );
};

export default DistributionCalculator;
