import * as React from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, showLabel = false, className, ...props }, ref) => {
    return (
      <Button ref={ref} className={className} {...props}>
        {icon}
        {showLabel && <span>{label}</span>}
      </Button>
    );
  },
);
IconButton.displayName = "IconButton";
