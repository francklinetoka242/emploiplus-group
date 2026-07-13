import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileTabValue } from "../types";

interface ProfileTabsProps {
  value: ProfileTabValue;
  onValueChange: (value: ProfileTabValue) => void;
}

const tabs: Array<{ value: ProfileTabValue; label: string }> = [
  { value: "profile", label: "Mon profil" },
  { value: "experience", label: "Mon parcours" },
  { value: "presentation", label: "Ma présentation professionnelle" },
  { value: "documents", label: "Mes documents" },
  { value: "preferences", label: "Mes préférences" },
  { value: "completion", label: "Complétude" },
];

export function ProfileTabs({ value, onValueChange }: ProfileTabsProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as ProfileTabValue)}>
      <TabsList className="flex w-full min-w-0 items-center justify-start gap-2 overflow-x-auto overflow-y-hidden bg-transparent p-0 pb-2 sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 data-[state=active]:border-[var(--secondary)] data-[state=active]:bg-[color:color-mix(in_srgb,var(--secondary)_15%,white)] data-[state=active]:text-[var(--secondary)]"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
