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
      <TabsList className="flex w-full max-w-full min-w-0 touch-pan-x items-center justify-start gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-2 bg-transparent p-0 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border sm:flex-wrap sm:overflow-visible">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="min-h-10 shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground data-[state=active]:border-secondary data-[state=active]:bg-secondary/15 data-[state=active]:text-secondary sm:px-4"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
