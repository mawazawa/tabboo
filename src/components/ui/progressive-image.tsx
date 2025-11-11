import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
}

export const ProgressiveImage = ({ 
  src, 
  alt, 
  placeholderSrc, 
  className,
  ...props 
}: ProgressiveImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        {...props}
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full transition-all duration-500",
          isLoading && placeholderSrc ? "blur-sm scale-105" : "blur-0 scale-100"
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
    </div>
  );
};
