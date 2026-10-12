import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getBillingSubscription,
  getPawaPayProviders,
  initiateCandidatePayment,
  refreshCandidatePayment,
  type BillingSubscription,
  type PaymentStatus,
  type PlanCode,
} from "@/features/billing/api/billingApi";

const planNames: Record<PlanCode, string> = {
  free: "Gratuit",
  premium: "Premium",
  premium_plus: "Premium+",
};

type Props = {
  targetPlanCode?: Exclude<PlanCode, "free">;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Aucune échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function paymentMessage(status: string, hasPaidScheduledChange: boolean) {
  if (status === "paid" && hasPaidScheduledChange) {
    return "Paiement confirmé. Le changement prendra effet à l’échéance ; vos droits actuels restent actifs jusque-là.";
  }
  if (status === "paid") return "Paiement confirmé. Vos droits ont été mis à jour.";
  if (status === "rejected") return "PawaPay a rejeté la demande. Aucun droit n’a été activé.";
  if (status === "failed") return "Le paiement a échoué. Aucun nouveau droit n’a été activé.";
  if (status === "pending") return "Paiement en attente de confirmation de l’opérateur.";
  if (status === "unknown" || status === "not_found") {
    return "Résultat incertain. Nous vérifions le dépôt existant ; ne relancez pas le paiement.";
  }
  return "Statut du paiement : " + status;
}

export function CandidateBillingPanel({ targetPlanCode }: Props) {
  const { session, authLoading } = useAuthContext();
  const accessToken = session?.access_token;
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [providerCode, setProviderCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const current = await getBillingSubscription(accessToken);
      setSubscription(current);
      const pendingOrder = current.pendingOrder;
      if (pendingOrder?.depositId) {
        setPayment((existing) =>
          existing?.orderId === pendingOrder.orderId
            ? existing
            : {
                orderId: pendingOrder.orderId,
                status: pendingOrder.attemptStatus === "unknown" ? "unknown" : pendingOrder.status,
              },
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Impossible de charger l’abonnement.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  useEffect(() => {
    if (!accessToken || !targetPlanCode) return;
    let cancelled = false;
    getPawaPayProviders(accessToken)
      .then(({ providers: availableProviders }) => {
        if (cancelled) return;
        setProviders(availableProviders);
        setProviderCode((current) =>
          current && availableProviders.includes(current) ? current : (availableProviders[0] ?? ""),
        );
      })
      .catch((providerError: unknown) => {
        if (!cancelled) {
          setError(
            providerError instanceof Error
              ? providerError.message
              : "Impossible de charger les opérateurs de paiement.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, targetPlanCode]);

  const submitPayment = async () => {
    if (!accessToken || !targetPlanCode) return;
    setBusy(true);
    setError(null);
    try {
      const result = await initiateCandidatePayment(accessToken, {
        planCode: targetPlanCode,
        providerCode,
        phoneNumber: phoneNumber.trim(),
      });
      setPayment(result);
      await loadSubscription();
    } catch (paymentError) {
      await loadSubscription();
      setError(
        paymentError instanceof Error
          ? `${paymentError.message} Si la demande a été envoyée, actualisez son statut avant de réessayer.`
          : "Le résultat du paiement est incertain. Actualisez son statut avant de réessayer.",
      );
    } finally {
      setBusy(false);
    }
  };

  const refreshPayment = async () => {
    if (!accessToken || !payment?.orderId) return;
    setBusy(true);
    setError(null);
    try {
      setPayment(await refreshCandidatePayment(accessToken, payment.orderId));
      await loadSubscription();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? `${statusError.message} Le statut n’a pas pu être vérifié.`
          : "Le statut n’a pas pu être vérifié.",
      );
    } finally {
      setBusy(false);
    }
  };

  const currentPlan = subscription?.entitlement.planCode;
  const pendingDepositId = subscription?.pendingOrder?.depositId;
  const hasPendingDeposit = Boolean(pendingDepositId);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Votre abonnement</h2>
        {authLoading || loading ? (
          <p className="mt-2 text-sm text-muted-foreground">Chargement de votre abonnement…</p>
        ) : subscription ? (
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>
              Forfait actuel :{" "}
              <span className="font-semibold text-foreground">
                {planNames[subscription.entitlement.planCode]}
              </span>
            </p>
            <p>Échéance : {formatDate(subscription.entitlement.expiresAt)}</p>
            {subscription.scheduledChange && (
              <p role="status" className="pt-1 text-primary">
                Changement vers {planNames[subscription.scheduledChange.targetPlanCode]} prévu le{" "}
                {formatDate(subscription.scheduledChange.effectiveAt)}.
                {subscription.scheduledChange.status === "awaiting_payment"
                  ? " En attente du paiement."
                  : ""}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {payment && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm"
        >
          {payment.status === "paid" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          ) : payment.status === "failed" || payment.status === "rejected" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          )}
          <span>
            {paymentMessage(
              payment.status,
              subscription?.scheduledChange?.status === "paid_scheduled",
            )}
          </span>
        </div>
      )}

      {targetPlanCode && (
        <div className="space-y-3 border-t border-border pt-4">
          {currentPlan && currentPlan !== targetPlanCode && currentPlan !== "free" && (
            <p className="text-sm text-muted-foreground">
              Le changement de forfait est programmé à l’échéance. Aucun prorata immédiat ni frais
              supplémentaires n’est appliqué.
            </p>
          )}
          <label className="block space-y-1.5 text-sm font-medium">
            Opérateur disponible en Sandbox
            <Select
              value={providerCode}
              onValueChange={setProviderCode}
              disabled={!providers.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un opérateur" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          {providers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun opérateur XAF pour les dépôts n’est disponible dans la configuration du compte.
            </p>
          )}
          <label className="block space-y-1.5 text-sm font-medium">
            Numéro de paiement au format international
            <Input
              autoComplete="tel"
              inputMode="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+…"
            />
          </label>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={
              busy || loading || !providerCode || phoneNumber.trim().length < 5 || hasPendingDeposit
            }
            onClick={() => void submitPayment()}
          >
            {busy
              ? "Vérification en cours…"
              : subscription?.pendingOrder
                ? "Reprendre le paiement"
                : `Payer ${targetPlanCode === "premium" ? "550" : "1 050"} XAF`}
          </Button>
          {hasPendingDeposit && (
            <p className="text-sm text-muted-foreground">
              Une commande est déjà en cours. Vérifiez son statut avant toute nouvelle demande.
            </p>
          )}
        </div>
      )}

      {(payment?.status === "pending" || payment?.status === "unknown") && (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void refreshPayment()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser le statut auprès de PawaPay
        </Button>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={busy || loading}
        onClick={() => void loadSubscription()}
      >
        Actualiser l’abonnement
      </Button>
    </section>
  );
}
