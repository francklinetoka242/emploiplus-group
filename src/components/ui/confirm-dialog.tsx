import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationRequest {
  title: string;
  description: string;
  resolve: (confirmed: boolean) => void;
}

export function useConfirmDialog() {
  const [request, setRequest] = useState<ConfirmationRequest | null>(null);

  const confirm = useCallback((description: string, title = "Confirmation") => {
    return new Promise<boolean>((resolve) => {
      setRequest({ title, description, resolve });
    });
  }, []);

  const close = (confirmed: boolean) => {
    if (!request) return;
    request.resolve(confirmed);
    setRequest(null);
  };

  const confirmationDialog = (
    <AlertDialog open={Boolean(request)} onOpenChange={(open) => !open && close(false)}>
      <AlertDialogContent className="rounded-2xl border-border bg-card shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          <AlertDialogDescription>{request?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={() => close(true)}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmationDialog };
}
