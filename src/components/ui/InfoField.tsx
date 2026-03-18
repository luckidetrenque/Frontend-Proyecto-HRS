import * as React from "react";

export const InfoField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-sm text-muted-foreground mb-1">{label}</p>
    <div className="font-medium">{children}</div>
  </div>
);
