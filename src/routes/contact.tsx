import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EmploiPlus Group" },
      { name: "description", content: "Contactez EmploiPlus Group pour vos projets tech, diffusion d'offres ou partenariats." },
      { property: "og:title", content: "Contact — EmploiPlus Group" },
      { property: "og:description", content: "Une question, un projet ? Écrivez-nous." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court").max(2000),
});

function ContactPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contacts_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) {
      toast.error(t("contact.error"));
    } else {
      toast.success(t("contact.success"));
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }
  };

  return (
    <div className="container-page py-16 md:py-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">{t("contact.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-10">
        <form onSubmit={onSubmit} className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-5 shadow-soft">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")} *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")} *</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t("common.subject")}</Label>
              <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("common.message")} *</Label>
            <Textarea id="message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
            <Send className="mr-1.5 size-4" /> {loading ? t("common.loading") : t("common.send")}
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-accent grid place-items-center text-brand"><Mail className="size-4" /></div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <a href="mailto:contact@emploiplus.group" className="text-sm font-semibold hover:text-brand">contact@emploiplus.group</a>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-accent grid place-items-center text-brand"><Phone className="size-4" /></div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Téléphone</div>
                <a href="tel:+242067311033" className="text-sm font-semibold hover:underline">+242067311033</a>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-accent grid place-items-center text-brand"><MapPin className="size-4" /></div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Localisation</div>
                <div className="text-sm font-semibold">Pointe-Noire · République du Congo</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
