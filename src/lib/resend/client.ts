// ==============================================================================
// PERLE NOIRE - RESEND EMAIL CLIENT (SCAFFOLD)
// Configured and ready for future transactional jewelry emails
// ==============================================================================

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';

export const resend = new Resend(resendApiKey);

export interface SendInquiryNotificationProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName?: string;
  preferredChannel: string;
  message: string;
}

export async function sendInquiryNotificationEmail(data: SendInquiryNotificationProps) {
  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || 'atelier@perlenoire-joaillerie.fr';

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
    // Scaffold mode: log inquiry safely
    console.info('[Email Scaffold] Notification de demande joaillerie reçue pour :', recipient, data);
    return { success: true, mocked: true };
  }

  return await resend.emails.send({
    from: 'Perle Noire Concierge <concierge@perlenoire-joaillerie.fr>',
    to: recipient,
    subject: `[Nouvelle Demande] ${data.productName ? `Intérêt pour ${data.productName}` : 'Demande Privée Atelier'}`,
    html: `
      <h2>Nouvelle demande reçue</h2>
      <p><strong>Client :</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Téléphone :</strong> ${data.customerPhone || 'Non renseigné'}</p>
      <p><strong>Canal souhaité :</strong> ${data.preferredChannel}</p>
      ${data.productName ? `<p><strong>Bijou concerné :</strong> ${data.productName}</p>` : ''}
      <hr />
      <p><strong>Message :</strong></p>
      <p>${data.message.replace(/\n/g, '<br/>')}</p>
    `,
  });
}
