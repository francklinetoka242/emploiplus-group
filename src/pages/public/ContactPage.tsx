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
      
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-16 md:py-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(232,169,0,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>
        <motion.div 
          className="container-page relative z-10 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p 
            className="inline-flex rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary ring-1 ring-secondary/20 mb-6"
            variants={fadeUp}
          >
            {t("contact.subtitle")}
          </motion.p>
          <motion.h1 
            className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6"
            variants={fadeUp}
          >
            {t("contact.title")}
          </motion.h1>
          <motion.p 
            className="text-lg text-slate-300 max-w-2xl mx-auto"
            variants={fadeUp}
          >
            {t("contact.subtitle")} - Nous répondons sous 24h
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Contact Content */}
      <section className="container-page py-20 md:py-28">
        <motion.div 
          className="grid gap-12 md:grid-cols-3 lg:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Quick Contact Cards */}
          <motion.div 
            className="md:col-span-3 lg:col-span-2"
            variants={staggerItem}
          >
            <div className="grid gap-6 mb-12">
              {/* Phone Card */}
              <motion.div 
                className="border-b border-secondary/25 py-6 first:pt-0 last:border-b-0"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 pt-1 text-secondary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("contact.info.phoneLabel")}
                    </p>
                    <a
                      href="tel:+242067311033"
                      className="text-xl font-bold text-secondary hover:text-secondary/80 transition-colors"
                    >
                      {t("contact.info.phoneValue")}
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("contact.info.phoneHelp")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Email Card */}
              <motion.div 
                className="border-b border-secondary/25 py-6 first:pt-0 last:border-b-0"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 pt-1 text-secondary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("contact.info.emailLabel")}
                    </p>
                    <a
                      href="mailto:contact@emploiplus.group"
                      className="text-xl font-bold text-secondary hover:text-secondary/80 transition-colors"
                    >
                      {t("contact.info.emailValue")}
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      contact@emploiplus.group
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Location Card */}
              <motion.div 
                className="border-b border-secondary/25 py-6 first:pt-0 last:border-b-0"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 pt-1 text-secondary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("contact.location.headquarter")}
                    </p>
                    <p className="text-xl font-bold text-secondary">
                      {t("contact.location.city")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("contact.location.country")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="md:col-span-3 lg:col-span-3"
            variants={staggerItem}
          >
            <div className="rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/8 via-card to-card p-8 md:p-10 shadow-sm">
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold text-foreground">
                  {t("contact.form.title")}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {t("contact.form.subtitle")}
                </p>
              </div>

              {submitted && (
                <motion.div 
                  className="mb-6 flex items-center gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-secondary-foreground" />
                  <p className="text-sm font-semibold text-secondary-foreground">
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
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
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
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 resize-none"
                  />
                </motion.div>

                <motion.div 
                  className="flex justify-end pt-4"
                  variants={staggerItem}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
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
