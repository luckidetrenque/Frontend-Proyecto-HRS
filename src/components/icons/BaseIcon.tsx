import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      {children}
    </svg>
  );
}
