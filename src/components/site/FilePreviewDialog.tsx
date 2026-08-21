import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type FilePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  title: string;
  description?: string;
};

export function FilePreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  title,
  description = "Prévisualisation du document dans une fenêtre centrée.",
}: FilePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,1200px)] max-w-6xl overflow-hidden rounded-[28px] border border-border bg-background p-0 shadow-2xl">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <DialogTitle className="truncate text-base font-semibold text-foreground sm:text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {description}
          </DialogDescription>
        </div>

        <div className="bg-muted/20 p-2 sm:p-3">
          <iframe
            src={fileUrl}
            title={title}
            className="h-[75vh] w-full rounded-2xl border-0 bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
