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
      <DialogContent className="w-[min(96vw,1200px)] max-h-[92vh] max-w-6xl overflow-hidden rounded-[24px] border border-border bg-background p-0 shadow-2xl sm:rounded-[28px]">
        <div className="border-b border-border px-3 py-2.5 sm:px-6 sm:py-3">
          <DialogTitle className="truncate text-sm font-semibold text-foreground sm:text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[11px] text-muted-foreground sm:text-sm">
            {description}
          </DialogDescription>
        </div>

        <div className="bg-muted/20 p-1.5 sm:p-3">
          <iframe
            src={fileUrl}
            title={title}
            className="h-[62vh] w-full rounded-xl border-0 bg-white sm:h-[75vh] sm:rounded-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
