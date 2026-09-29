'use server';

// ==============================================================================
// PERLE NOIRE - CONTACT & INQUIRY ACTIONS
// Handles bespoke inquiries, appointment requests & product questions
// ==============================================================================

import { ContactInquirySchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';
import { sendInquiryNotificationEmail } from '@/lib/resend/client';
import { initialContactRequests } from '@/lib/data/mock-data';
import { ContactRequest } from '@/types/database';

export async function submitContactInquiry(payload: unknown): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const validated = ContactInquirySchema.parse(payload);

    const newRequest: Partial<ContactRequest> = {
      id: `req-${Date.now()}`,
      product_id: validated.product_id || null,
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      preferred_channel: validated.preferred_channel,
      message: validated.message,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    initialContactRequests.unshift(newRequest as ContactRequest);

    try {
      const supabase = await createClient();
      await supabase.from('contact_requests').insert({
        product_id: validated.product_id || null,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        preferred_channel: validated.preferred_channel,
        message: validated.message,
        status: 'new',
      });
    } catch {
      // Supabase in dev/placeholder mode
    }

    // Send email notification to atelier concierge
    await sendInquiryNotificationEmail({
      customerName: validated.name,
      customerEmail: validated.email,
      customerPhone: validated.phone || undefined,
      preferredChannel: validated.preferred_channel,
      message: validated.message,
    });

    return {
      success: true,
      message: 'Votre message a été transmis à notre atelier. Notre concierge joaillier vous répondra dans les plus brefs délais.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue lors de l’envoi de votre demande';
    return { success: false, error: errorMsg };
  }
}
