import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  { value: "pdf", label: "Profil PDF" },
  { value: "preferences", label: "Mes préférences" },
  { value: "completion", label: "Complétude" },
];

export function ProfileTabs({ value, onValueChange }: ProfileTabsProps) {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;

    setCanScrollLeft(tabsList.scrollLeft > 0);
    setCanScrollRight(tabsList.scrollLeft + tabsList.clientWidth < tabsList.scrollWidth - 1);
  };

  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;

    updateScrollState();
    tabsList.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      tabsList.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const activeTab = tabsListRef.current?.querySelector<HTMLElement>('[data-state="active"]');
    activeTab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    window.requestAnimationFrame(updateScrollState);
  }, [value]);

  const scrollTabs = (direction: number) => {
    tabsListRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as ProfileTabValue)}>
      <div className="flex min-w-0 items-center gap-2 py-2">
        <button
          type="button"
          onClick={() => scrollTabs(-1)}
          disabled={!canScrollLeft}
          aria-label="Faire défiler les onglets vers la gauche"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <TabsList
          ref={tabsListRef}
          className="flex h-auto w-full max-w-full min-w-0 touch-pan-x items-center justify-start gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-2 bg-transparent p-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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

        <button
          type="button"
          onClick={() => scrollTabs(1)}
          disabled={!canScrollRight}
          aria-label="Faire défiler les onglets vers la droite"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Tabs>
  );
}
