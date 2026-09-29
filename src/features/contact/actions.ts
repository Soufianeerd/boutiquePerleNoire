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
import { requireAdmin } from '@/lib/auth/admin';
import { revalidatePath } from 'next/cache';

/**
 * Public action: Customers submitting a bespoke inquiry or salon appointment request.
 */
export async function submitContactInquiry(payload: unknown): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const validated = ContactInquirySchema.parse(payload);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isSupabaseConfigured) {
      const supabase = await createClient();
      const { error: insertError } = await supabase.from('contact_requests').insert({
        product_id: validated.product_id || null,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        preferred_channel: validated.preferred_channel,
        message: validated.message,
        status: 'new',
      });

      if (insertError) {
        return {
          success: false,
          error: 'Une erreur est survenue lors de l’enregistrement de votre demande.',
        };
      }
    } else {
      // Local development fallback
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

/**
 * Admin mutation: updates the status and internal notes of a contact request.
 * STRICT: Requires active admin authentication.
 */
export async function updateContactStatusAction(
  requestId: string,
  newStatus: 'new' | 'in_progress' | 'answered' | 'closed',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      success: false,
      error: 'Supabase n’est pas configuré.',
    };
  }

  try {
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('contact_requests')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Audit log
    await supabase.from('activity_logs').insert({
      admin_id: admin.id,
      action: 'update_contact_status',
      entity_type: 'contact_request',
      entity_id: requestId,
      details: { status: newStatus, notes: adminNotes },
    });

    revalidatePath('/admin/clients');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
    return { success: false, error: msg };
  }
}
