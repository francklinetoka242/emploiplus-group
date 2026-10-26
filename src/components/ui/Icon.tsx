import type { ComponentPropsWithoutRef } from "react";
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";

interface IconProps extends Omit<ComponentPropsWithoutRef<"svg">, "color"> {
  icon: PhosphorIcon;
  size?: number | string;
  weight?: IconWeight;
  color?: string;
}

export function Icon({
  icon: PhosphorComponent,
  size = 20,
  weight = "duotone",
  color = "var(--icon-color)",
  className,
  ...props
}: IconProps) {
  return (
    <PhosphorComponent
      size={size}
      weight={weight}
      color={color}
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Icon;
