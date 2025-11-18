import { Skeleton } from "@/components/ui/skeleton";

export const PanelSkeleton = () => (
  <div className="w-full h-full p-4 space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

export const ViewerSkeleton = () => (
  <div className="w-full h-full p-6 space-y-6">
    <Skeleton className="h-10 w-1/2 mx-auto" />
    <Skeleton className="h-96 w-full max-w-2xl mx-auto" />
    <Skeleton className="h-4 w-48 mx-auto" />
  </div>
);

