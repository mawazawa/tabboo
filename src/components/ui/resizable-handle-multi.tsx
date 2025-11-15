import * as ResizablePrimitive from "react-resizable-panels";
import { GripVertical } from "@/icons";
import { cn } from "@/lib/utils";

const ResizableHandleMulti = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="flex flex-col h-full w-full items-center justify-between py-4">
        {/* Top Handle */}
        <div className="z-10 flex flex-col gap-0.5 rounded-sm border bg-background px-0.5 py-1.5 shadow-sm">
          <GripVertical className="h-2.5 w-2.5" strokeWidth={1.5} />
          <GripVertical className="h-2.5 w-2.5" strokeWidth={1.5} />
        </div>
        
        {/* Middle Handle */}
        <div className="z-10 flex flex-col gap-0.5 rounded-sm border bg-background px-0.5 py-1.5 shadow-sm">
          <GripVertical className="h-2.5 w-2.5" strokeWidth={1.5} />
          <GripVertical className="h-2.5 w-2.5" strokeWidth={1.5} />
        </div>
        
        {/* Bottom Handle */}
        <div className="z-10 flex flex-col gap-0.5 rounded-sm border bg-background px-0.5 py-1.5 shadow-sm">
          <GripVertical className="h-2.5 w-2.5" strokeWidth={1.5} />
          <GripVertical className="h-2.5 w-2.5" strokeWidth={1.5} />
        </div>
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizableHandleMulti };
