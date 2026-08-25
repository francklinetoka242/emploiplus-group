import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function ThemeSwitch({ checked, onCheckedChange, className }: ThemeSwitchProps) {
  return (
    <label className={cn("relative inline-block h-7 w-12 cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
        aria-label="Activer ou désactiver le mode sombre"
      />
      <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-primary" />
      <Sun className="absolute start-1.5 top-1.5 hidden size-4 text-primary-foreground peer-checked:block" aria-hidden="true" />
      <Moon className="absolute end-1.5 top-1.5 block size-4 text-slate-700 peer-checked:hidden" aria-hidden="true" />
      <span className="absolute start-1 top-1 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  );
}
