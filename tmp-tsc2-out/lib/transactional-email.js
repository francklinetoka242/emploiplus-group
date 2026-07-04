export function renderTransactionalEmail(options) {
    const fromName = options.fromName || 'EmploiPlus Group';
    const brandColor = options.brandColor || '#00009E';
    const accentColor = options.accentColor || '#E8A900';
    const supportEmail = options.supportEmail || 'contact@emploiplus-group.com';
    const supportPhone = options.supportPhone || '+242 0673 11033';
    const whatsappUrl = options.whatsappUrl || 'https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631';
    const companyAddress = options.companyAddress || 'Pointe-Noire, République du Congo';
    const footerNote = options.footerNote || 'Recrutement • Opportunités • Accompagnement professionnel';
    const bodySection = options.bodyHtml
        ? `<div style="margin:0 0 24px 0;">${options.bodyHtml}</div>`
        : '';
    return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
      </head>
      <body style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Inter, Segoe UI, Arial, sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:24px 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,0.06);">
                <tr>
                  <td style="background-color:${brandColor};padding:28px 32px;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom:10px;">
                          <img src="${options.logoUrl}" alt="${fromName}" width="56" height="56" style="display:block;margin:0 auto;max-width:56px;height:auto;border-radius:12px;background-color:#ffffff;padding:4px;" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;font-family:Inter, Segoe UI, Arial, sans-serif;">
                          ${fromName}
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:14px;line-height:1.5;color:#e9ecff;padding-top:6px;font-family:Inter, Segoe UI, Arial, sans-serif;">
                          Email transactionnel
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 20px 32px;background-color:#ffffff;">
                    <p style="margin:0 0 14px;font-size:18px;line-height:1.5;color:#0f172a;font-family:Inter, Segoe UI, Arial, sans-serif;">
                      Bonjour,
                    </p>
                    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">
                      <strong style="color:${brandColor};">${options.title}</strong>
                    </p>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">
                      ${options.intro}
                    </p>
                    ${bodySection}
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 24px 0;">
                      <tr>
                        <td align="center" bgcolor="${accentColor}" style="border-radius:10px;">
                          <a href="${options.ctaUrl}" target="_blank" rel="noreferrer" style="display:inline-block;padding:14px 30px;font-size:15px;line-height:1.2;font-weight:700;color:${brandColor};text-decoration:none;font-family:Inter, Segoe UI, Arial, sans-serif;">
                            ${options.ctaLabel}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;border-top:1px solid #e5e7eb;padding-top:16px;">
                      <tr>
                        <td style="font-size:14px;line-height:1.7;color:#334155;font-family:Inter, Segoe UI, Arial, sans-serif;">
                          <div style="margin-bottom:8px;">✓ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</div>
                          <div>✓ Pour toute aide, vous pouvez nous contacter via les coordonnées ci-dessous.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#f8fafc;padding:24px 32px;border-top:3px solid ${accentColor};">
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.4;font-weight:700;color:#0f172a;font-family:Inter, Segoe UI, Arial, sans-serif;">Nous contacter</p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Téléphone : <a href="tel:${supportPhone.replace(/[^0-9+]/g, '')}" style="color:${brandColor};text-decoration:none;">${supportPhone}</a></p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Email : <a href="mailto:${supportEmail}" style="color:${brandColor};text-decoration:none;">${supportEmail}</a></p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Ville : ${companyAddress}</p>
                    <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Offres WhatsApp : <a href="${whatsappUrl}" style="color:${brandColor};text-decoration:none;">${whatsappUrl}</a></p>
                    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">EmploiPlus Group WhatsApp : <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" style="color:${brandColor};text-decoration:none;">whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43</a></p>
                    <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:#64748b;font-family:Inter, Segoe UI, Arial, sans-serif;">© ${fromName}</p>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;font-family:Inter, Segoe UI, Arial, sans-serif;">${footerNote}</p>
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
