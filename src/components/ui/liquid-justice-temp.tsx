// Temporary workaround for @liquid-justice/design-system components
// These re-export shadcn/ui components with the same API until the liquid-justice package is built

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Input } from "./input";
export { Button } from "./button";
export { Label } from "./label";
export { Badge } from "./badge";
export { Separator } from "./separator";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

// Temporary replacements for specialized liquid-justice components
export { Accordion as LiquidGlassAccordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
export { LiquidSlider } from "./liquid-slider";