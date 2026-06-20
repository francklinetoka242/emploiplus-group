import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CrudDialog({
  trigger, title, children, onSubmit, submitting, open, onOpenChange,
}: {
  trigger?: ReactNode; title: string; children: ReactNode;
  onSubmit: () => void | Promise<void>; submitting?: boolean;
  open?: boolean; onOpenChange?: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">{children}</div>
        <DialogFooter>
          <Button onClick={() => onSubmit()} disabled={submitting} className="bg-brand text-brand-foreground hover:bg-brand/90">
            {submitting ? "..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-brand">
      <Plus className="size-4 mr-1.5" /> Nouveau
    </Button>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Modifier"><Pencil className="size-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Supprimer"><Trash2 className="size-4 text-destructive" /></Button>
    </div>
  );
}

export function useDelete(table: "job_offers" | "services" | "blog_posts" | "contacts_messages", queryKey: string) {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);
  const del = async (id: string) => {
    if (!confirm("Confirmer la suppression ?")) return;
    setPending(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setPending(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Supprimé");
      qc.invalidateQueries({ queryKey: [queryKey] });
    }
  };
  return { del, pending };
}

export { useState };
