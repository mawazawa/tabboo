import { Suspense, type ComponentType, type ReactNode } from "react";

interface MobileFormViewerSectionProps<TProps extends object> {
  FormViewerComponent: ComponentType<TProps>;
  sharedFormViewerProps: TProps;
  fallback: ReactNode;
}

export const MobileFormViewerSection = <TProps extends object>({
  FormViewerComponent,
  sharedFormViewerProps,
  fallback,
}: MobileFormViewerSectionProps<TProps>) => (
  <div className="md:hidden flex-1 overflow-hidden">
    <Suspense fallback={fallback}>
      <FormViewerComponent {...sharedFormViewerProps} />
    </Suspense>
  </div>
);

