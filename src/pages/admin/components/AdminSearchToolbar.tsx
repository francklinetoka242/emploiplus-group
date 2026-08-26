import React from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminSearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  filters?: React.ReactNode;
  filtersActive?: boolean;
}

export function AdminSearchToolbar({
  value,
  onChange,
  placeholder,
  filters,
  filtersActive = false,
}: AdminSearchToolbarProps) {
  const [searchOpen, setSearchOpen] = React.useState(Boolean(value));
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        {searchOpen ? (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              className="h-10 rounded-xl pl-9 pr-9"
              aria-label={placeholder}
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Effacer la recherche"
                title="Effacer la recherche"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setSearchOpen((open) => !open)}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Rechercher"
          title="Rechercher"
        >
          <Search className="size-4" />
        </Button>
        <Button
          type="button"
          variant={filtersActive ? "secondary" : "outline"}
          size="icon"
          onClick={() => setFiltersOpen((open) => !open)}
          className="relative h-10 w-10 shrink-0 rounded-full"
          aria-label="Filtres"
          title="Filtres"
        >
          <Filter className="size-4" />
          {filtersActive ? <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" /> : null}
        </Button>
      </div>
      {filtersOpen && filters ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted/30 p-3">
          {filters}
        </div>
      ) : null}
    </div>
  );
}
