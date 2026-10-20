export type TransactionalEmailOptions = {
  title: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  bodyHtml?: string;
  logoUrl: string;
  fromName?: string;
  brandColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  ctaTextColor?: string;
  headerSubtitleColor?: string;
  showHeaderSubtitle?: boolean;
  borderless?: boolean;
  contactLayout?: "list" | "icon-row";
  whatsappIconUrl?: string;
  copyrightText?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappUrl?: string;
  companyAddress?: string;
  footerNote?: string;
};

export function renderTransactionalEmail(options: TransactionalEmailOptions) {
  const fromName = options.fromName || "EmploiPlus Group";
  const brandColor = options.brandColor || "#00009E";
  const accentColor = options.accentColor || "#00009E";
  const backgroundColor = options.backgroundColor || "#ffffff";
  const footerBackgroundColor = options.backgroundColor || "#ffffff";
  const textColor = options.textColor || "#0f172a";
  const noticeTextColor = options.textColor || "#0f172a";
  const footerTextColor = options.textColor || "#0f172a";
  const ctaTextColor = options.ctaTextColor || "#ffffff";
  const headerSubtitleColor = options.headerSubtitleColor || "#e9ecff";
  const supportEmail = options.supportEmail || "contact@emploiplus-group.com";
  const supportPhone = options.supportPhone || "+242 0673 11033";
  const whatsappUrl =
    options.whatsappUrl || "https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631";
  const whatsappIconUrl =
    options.whatsappIconUrl || "https://emploiplus-group.com/whatsapp-icon.png";
  const whatsappIconMarkup = `<img src="${whatsappIconUrl}" alt="WhatsApp" width="24" height="24" style="display:block;width:24px;height:24px;margin:0 auto 6px;" />`;
  const companyAddress = options.companyAddress || "Pointe-Noire, République du Congo";
  const footerNote =
    options.footerNote || "Recrutement • Opportunités • Accompagnement professionnel";
  const cardStyle = options.borderless !== false
    ? "max-width:600px;background-color:#ffffff;border-radius:0;overflow:hidden;border:0;box-shadow:none;"
    : "max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,0.06);";
  const headerSubtitle = options.showHeaderSubtitle === true
    ? `<tr><td align="center" style="font-size:14px;line-height:1.5;color:${headerSubtitleColor};padding-top:6px;font-family:Inter, Segoe UI, Arial, sans-serif;">Email transactionnel</td></tr>`
    : "";
  const contactItems = [
    {
      icon: "☎",
      label: "Téléphone",
      value: `<a href="tel:${supportPhone.replace(/[^0-9+]/g, "")}" style="color:${brandColor};text-decoration:none;">${supportPhone}</a>`,
    },
    {
      icon: "✉",
      label: "Email",
      value: `<a href="mailto:${supportEmail}" style="color:${brandColor};text-decoration:none;word-break:break-all;">${supportEmail}</a>`,
    },
    { icon: "📍", label: "Ville", value: companyAddress },
    {
      icon: whatsappIconMarkup,
      label: "Offres WhatsApp",
      value: `<a href="${whatsappUrl}" style="color:${brandColor};text-decoration:none;word-break:break-all;">${whatsappUrl}</a>`,
    },
    {
      icon: whatsappIconMarkup,
      label: "EmploiPlus Group WhatsApp",
      value: `<a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" style="color:${brandColor};text-decoration:none;word-break:break-all;">whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43</a>`,
    },
  ];
  const contactSection = options.contactLayout !== "list"
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed;margin:0 0 20px;"><tr>${contactItems.map(({ icon, label, value }) => `<td width="20%" valign="top" align="center" style="padding:8px 4px;font-size:11px;line-height:1.4;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;"><div aria-hidden="true" style="font-size:21px;line-height:1.2;color:${brandColor};margin-bottom:6px;">${icon}</div><div style="font-weight:700;margin-bottom:3px;">${label}</div><div style="overflow-wrap:anywhere;word-break:break-word;">${value}</div></td>`).join("")}</tr></table>`
    : `<p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;">Téléphone : <a href="tel:${supportPhone.replace(/[^0-9+]/g, "")}" style="color:${brandColor};text-decoration:none;">${supportPhone}</a></p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;">Email : <a href="mailto:${supportEmail}" style="color:${brandColor};text-decoration:none;">${supportEmail}</a></p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;">Ville : ${companyAddress}</p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;">Offres WhatsApp : <a href="${whatsappUrl}" style="color:${brandColor};text-decoration:none;">${whatsappUrl}</a></p>
                    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;">EmploiPlus Group WhatsApp : <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" style="color:${brandColor};text-decoration:none;">whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43</a></p>`;
  const footerBorder = options.borderless !== false ? "border-top:0;" : `border-top:3px solid ${accentColor};`;
  const noticeBorder = options.borderless !== false ? "border-top:0;" : "border-top:1px solid #e5e7eb;";
  const copyrightText =
    options.copyrightText || `© ${fromName} · © 2025 Emploiplus Group. Tous droits réservés.`;

  const bodySection = options.bodyHtml
    ? `<div style="margin:0 0 24px 0;">${options.bodyHtml}</div>`
    : "";

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
      </head>
      <body style="margin:0;padding:24px;background-color:${backgroundColor};font-family:Inter, Segoe UI, Arial, sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:24px 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${cardStyle}">
                <tr>
                  <td style="background-color:${brandColor};padding:28px 32px;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td align="center" style="padding-bottom:10px;"><img src="${options.logoUrl}" alt="${fromName}" width="56" height="56" style="display:block;margin:0 auto;max-width:56px;height:auto;border-radius:12px;background-color:#ffffff;padding:4px;" /></td></tr>
                      <tr><td align="center" style="font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;font-family:Inter, Segoe UI, Arial, sans-serif;">${fromName}</td></tr>
                      ${headerSubtitle}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 20px 32px;background-color:#ffffff;">
                    <p style="margin:0 0 14px;font-size:18px;line-height:1.5;color:#0f172a;font-family:Inter, Segoe UI, Arial, sans-serif;">Bonjour,</p>
                    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;"><strong style="color:${brandColor};">${options.title}</strong></p>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${textColor};font-family:Inter, Segoe UI, Arial, sans-serif;">${options.intro}</p>
                    ${bodySection}
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 24px 0;"><tr><td align="center" bgcolor="${accentColor}" style="border-radius:10px;"><a href="${options.ctaUrl}" target="_blank" rel="noreferrer" style="display:inline-block;padding:14px 30px;font-size:15px;line-height:1.2;font-weight:700;color:${ctaTextColor};text-decoration:none;font-family:Inter, Segoe UI, Arial, sans-serif;">${options.ctaLabel}</a></td></tr></table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;${noticeBorder}padding-top:16px;"><tr><td style="font-size:14px;line-height:1.7;color:${noticeTextColor};font-family:Inter, Segoe UI, Arial, sans-serif;"><div style="margin-bottom:8px;">✓ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</div><div>✓ Pour toute aide, vous pouvez nous contacter via les coordonnées ci-dessous.</div></td></tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:${footerBackgroundColor};padding:24px 32px;${footerBorder}">
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.4;font-weight:700;color:#0f172a;font-family:Inter, Segoe UI, Arial, sans-serif;">Nous contacter</p>
                    ${contactSection}
                    <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:${footerTextColor};font-family:Inter, Segoe UI, Arial, sans-serif;">${copyrightText}</p>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:${footerTextColor};font-family:Inter, Segoe UI, Arial, sans-serif;">${footerNote}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
