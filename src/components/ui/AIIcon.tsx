interface AIIconProps {
  className?: string;
}

export function AIIcon({ className }: AIIconProps) {
  return (
    <img src="/intelligence-artificielle.png" alt="" aria-hidden="true" className={className} />
  );
}
