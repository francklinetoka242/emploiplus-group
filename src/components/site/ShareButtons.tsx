import { useState } from "react";
import { Link2, Check, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareUrls } from "@/lib/utils-ext";
import { useI18n } from "@/lib/i18n";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const links = buildShareUrls({ url, text });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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
