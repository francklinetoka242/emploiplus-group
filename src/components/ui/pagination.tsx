import * as React from "react";
import { CaretLeftIcon as ChevronLeft, CaretRightIcon as ChevronRight, DotsThreeIcon as MoreHorizontal } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  appearance?: "default" | "minimal";
}

export function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
  appearance = "default",
}: PaginationNavProps) {
  if (totalPages <= 1) return null;

  const buttonBackground =
    appearance === "minimal" ? "bg-transparent hover:bg-transparent" : "bg-muted/50 hover:bg-muted";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center gap-x-1 gap-y-2", className)}
    >
      <button
        type="button"
        className={cn(
          "rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition disabled:pointer-events-none disabled:opacity-50",
          buttonBackground,
        )}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={disabled || currentPage <= 1}
      >
        Précédent
      </button>
      <div className="flex items-center gap-x-1">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              type="button"
              className={cn(
                "h-9 w-9 rounded-lg border border-border text-sm font-medium text-foreground transition aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground disabled:pointer-events-none disabled:opacity-50",
                buttonBackground,
              )}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
              disabled={disabled || page === currentPage}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={cn(
          "rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition disabled:pointer-events-none disabled:opacity-50",
          buttonBackground,
        )}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={disabled || currentPage >= totalPages}
      >
        Suivant
      </button>
    </nav>
  );
}

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Aller à la page précédente"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Précédent</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Aller à la page suivante"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Suivant</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Plus de pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
