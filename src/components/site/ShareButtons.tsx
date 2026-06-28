import { useState } from "react";
import { Link2, Check, Facebook, Linkedin, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareUrls } from "@/lib/utils-ext";
import { useI18n } from "@/lib/i18n";

export function ShareButtons({ url, text, variant = "full", className = "" }: { url: string; text: string; variant?: "full" | "compact"; className?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const shareText = [text, "Offre partagée depuis https://emploiplus-group.com"].filter(Boolean).join("\n\n");
  const links = buildShareUrls({ url, text: shareText });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setOpen(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <Button type="button" variant="outline" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Partager l'offre" className="h-9 w-9 rounded-full border-border bg-background/90 shadow-sm">
          <Share2 className="size-4" />
        </Button>
        {open ? (
          <div className="absolute right-0 top-full z-20 mt-2 flex min-w-[180px] flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-elev">
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
              <MessageSquare className="size-3.5" /> WhatsApp
            </a>
            <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
              <Facebook className="size-3.5" /> Facebook
            </a>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
              <Linkedin className="size-3.5" /> LinkedIn
            </a>
            <Button type="button" variant="outline" size="sm" onClick={copy} className="justify-start gap-2">
              {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
              {copied ? t("common.copied") : t("cta.copyLink")}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-[#25D366] text-white hover:opacity-90 transition">
        WhatsApp
      </a>
      <a href={links.facebook} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-[#1877F2] text-white hover:opacity-90 transition">
        <Facebook className="size-3.5" /> Facebook
      </a>
      <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-[#0A66C2] text-white hover:opacity-90 transition">
        <Linkedin className="size-3.5" /> LinkedIn
      </a>
      <a href={links.x} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-foreground text-background hover:opacity-90 transition">
        X
      </a>
      <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-1.5">
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
        {copied ? t("common.copied") : t("cta.copyLink")}
      </Button>
    </div>
  );
}
