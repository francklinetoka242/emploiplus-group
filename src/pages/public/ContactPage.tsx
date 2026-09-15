import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations/animations";

export function ContactPage() {
  const { t } = useI18n();
  const [formData, setFormData] = React.useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitted(false);
    setSubmitError("");

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: "contact@emploiplus.group",
          replyTo: formData.email.trim(),
          subject: formData.subject.trim(),
          text: `Nom : ${formData.name}\nEmail : ${formData.email}\n\n${formData.message}`,
          html: `<p><strong>Nom :</strong> ${escapeHtml(formData.name)}</p><p><strong>Email :</strong> ${escapeHtml(formData.email)}</p><p>${escapeHtml(formData.message).replace(/\n/g, "<br />")}</p>`,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Impossible d'envoyer votre message.");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      window.setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d'envoyer votre message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={t("contact.title")}
        description={t("contact.subtitle")}
        keywords="contact, nous contacter, support, recrutement, développement web"
        canonical={`${BASE_URL}/contact`}
        robots="index,follow"
        ogType="website"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("contact.title"), url: `${BASE_URL}/contact` },
        ]}
      />
      
      {/* Contact Content */}
      <section className="container-page py-12 md:py-16">
        <motion.div 
          className="grid gap-8 md:grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Quick Contact Cards */}
          <motion.div 
            className="w-full lg:pr-2"
            variants={staggerItem}
          >
            <div className="grid gap-4 mb-0 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
              {/* Phone Card */}
              <motion.div 
                className="border-b border-primary/25 py-4 first:pt-0 last:border-b-0"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("contact.info.phoneLabel")}
                    </p>
                    <a
                      href="tel:+242067311033"
                      className="text-lg font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("contact.info.phoneValue")}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("contact.info.phoneHelp")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Email Card */}
              <motion.div 
                className="border-b border-primary/25 py-4 first:pt-0 last:border-b-0"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("contact.info.emailLabel")}
                    </p>
                    <a
                      href="mailto:contact@emploiplus.group"
                      className="text-lg font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("contact.info.emailValue")}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      contact@emploiplus.group
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Location Card */}
              <motion.div 
                className="border-b border-primary/25 py-4 first:pt-0 last:border-b-0"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("contact.location.headquarter")}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {t("contact.location.city")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("contact.location.country")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="w-full lg:justify-self-end"
            variants={staggerItem}
          >
            <div className="w-full max-w-[560px] rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-card p-6 md:p-7 shadow-sm">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {t("contact.form.title")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("contact.form.subtitle")}
                </p>
              </div>

              {submitted && (
                <motion.div 
                  className="mb-6 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                  <p className="text-sm font-semibold text-primary">
                    Merci ! Votre message a été envoyé avec succès.
                  </p>
                </motion.div>
              )}

              {submitError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <motion.div variants={staggerItem}>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      {t("contact.form.label.name")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t("contact.form.placeholder.name")}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      {t("contact.form.label.email")} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t("contact.form.placeholder.email")}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </motion.div>
                </div>

                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t("contact.form.label.subject")} *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder={t("contact.form.placeholder.subject")}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t("contact.form.label.message")} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={t("contact.form.placeholder.message")}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  />
                </motion.div>

                <motion.div 
                  className="flex justify-end pt-4"
                  variants={staggerItem}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Envoi en cours..." : t("contact.form.submit")}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
