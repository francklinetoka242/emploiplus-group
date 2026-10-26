import { Link } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { DashboardIcon } from "./DashboardIcon";
import type { CompletionItem } from "@/features/profile/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CompletionDetailsProps {
  items: CompletionItem[];
}

export function CompletionDetails({ items }: CompletionDetailsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-xs font-medium text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Voir le détail
        </button>
      </PopoverTrigger>
      <PopoverContent
        id="profile-completion-details"
        align="start"
        side="bottom"
        collisionPadding={12}
        className="max-h-[min(70vh,24rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-md border-border bg-background p-3 text-foreground shadow-none"
      >
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-xs">
              {item.isCompleted ? (
                <CheckCircle
                  size={16}
                  weight="duotone"
                  aria-label="Complété"
                  className="shrink-0 text-primary"
                />
              ) : (
                <span
                  aria-label="À compléter"
                  className="w-4 shrink-0 text-center text-muted-foreground"
                >
                  –
                </span>
              )}
              <span className="min-w-0 flex-1">{item.label}</span>
              {!item.isCompleted && (
                <Link
                  to={item.route}
                  className="shrink-0 font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Compléter
                  <DashboardIcon name="ArrowRight" size={13} className="ml-1 inline" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
