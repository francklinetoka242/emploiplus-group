import React from "react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { Button } from "@/components/ui/button";

export function ContactPage() {
  const { t } = useI18n();
  const [formData, setFormData] = React.useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
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
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Contact Form Card */}
          <div className="rounded-3xl p-[1px] gradient-brand">
            <div className="rounded-3xl bg-card p-8 md:p-10">
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {t("contact.form.title")}
                </h2>
                <p className="mt-2 text-muted-foreground">{t("contact.form.subtitle")}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto md:mx-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      {t("contact.form.label.name")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t("contact.form.placeholder.name")}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      {t("contact.form.label.email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t("contact.form.placeholder.email")}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    {t("contact.form.label.subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder={t("contact.form.placeholder.subject")}
                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    {t("contact.form.label.message")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder={t("contact.form.placeholder.message")}
                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-brand hover:bg-brand/90 text-brand-foreground font-semibold shadow-brand"
                  >
                    {t("contact.form.submit")}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <aside className="space-y-6 md:sticky md:top-24">
            {/* Direct Contact Card */}
            <div className="rounded-2xl p-[1px] gradient-brand">
              <div className="rounded-2xl bg-card p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">
                    {t("contact.info.directTitle")}
                  </h3>
                  <div className="space-y-5">
                    {/* Phone */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg
                            className="h-5 w-5 text-brand"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
                          {t("contact.info.phoneLabel")}
                        </p>
                        <a
                          href="tel:+242067311033"
                          className="text-lg font-semibold text-brand hover:text-brand/80"
                        >
                          {t("contact.info.phoneValue")}
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("contact.info.phoneHelp")}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg
                            className="h-5 w-5 text-brand"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
                          {t("contact.info.emailLabel")}
                        </p>
                        <a
                          href="mailto:contact@emploiplus.group"
                          className="text-lg font-semibold text-foreground hover:text-brand"
                        >
                          {t("contact.info.emailValue")}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {t("contact.location.title")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                    {t("contact.location.headquarter")}
                  </p>
                  <p className="text-lg text-foreground font-semibold">
                    {t("contact.location.city")}
                  </p>
                  <p className="text-foreground/80">{t("contact.location.country")}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
