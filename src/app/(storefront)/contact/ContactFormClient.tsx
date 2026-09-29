'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { submitContactInquiry } from '@/features/contact/actions';
import { CheckCircle2, MessageSquare, Phone, Send } from 'lucide-react';
import { ContactMethod } from '@/types/database';

interface ContactFormClientProps {
  defaultContactMethod?: ContactMethod;
}

export function ContactFormClient({
  defaultContactMethod = 'whatsapp',
}: ContactFormClientProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<ContactMethod>(defaultContactMethod);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await submitContactInquiry({
      name,
      email,
      phone: phone || null,
      preferred_channel: channel,
      message,
    });

    setLoading(false);
    if (res.success) {
      setStatus({ success: true, msg: res.message });
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } else {
      setStatus({ success: false, msg: res.error });
    }
  };

  if (status?.success) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F6F1EA] flex items-center justify-center text-[#171717]">
          <CheckCircle2 className="w-6 h-6 stroke-[1.25]" />
        </div>
        <h3 className="font-editorial text-2xl text-[#171717]">Votre message a été transmis</h3>
        <p className="text-xs sm:text-sm text-[#77716A] max-w-md mx-auto leading-relaxed font-light">
          {status.msg}
        </p>
        <div className="pt-4">
          <Button variant="outline" size="sm" onClick={() => setStatus(null)}>
            Envoyer un autre message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-editorial text-2xl text-[#171717]">
          Formulaire de contact
        </h2>
        <p className="text-xs text-[#77716A] mt-1 font-light">
          Transmettez-nous votre message, nous vous répondrons dans les plus brefs délais.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Votre nom & prénom *"
          placeholder="Votre nom"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Adresse e-mail *"
          type="email"
          placeholder="votre@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Numéro de téléphone"
          type="tel"
          placeholder="+33 6 00 00 00 00"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-[#77716A] font-medium">
            Canal de réponse souhaité
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={`py-2 text-[11px] border transition-colors flex items-center justify-center gap-1.5 ${
                channel === 'whatsapp'
                  ? 'border-[#171717] bg-[#171717] text-[#FCFAF7]'
                  : 'border-[#E7E0D7] bg-[#FCFAF7] text-[#77716A] hover:border-[#171717]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[1.25]" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setChannel('phone')}
              className={`py-2 text-[11px] border transition-colors flex items-center justify-center gap-1.5 ${
                channel === 'phone'
                  ? 'border-[#171717] bg-[#171717] text-[#FCFAF7]'
                  : 'border-[#E7E0D7] bg-[#FCFAF7] text-[#77716A] hover:border-[#171717]'
              }`}
            >
              <Phone className="w-3.5 h-3.5 stroke-[1.25]" /> Appel
            </button>
            <button
              type="button"
              onClick={() => setChannel('email')}
              className={`py-2 text-[11px] border transition-colors flex items-center justify-center gap-1.5 ${
                channel === 'email'
                  ? 'border-[#171717] bg-[#171717] text-[#FCFAF7]'
                  : 'border-[#E7E0D7] bg-[#FCFAF7] text-[#77716A] hover:border-[#171717]'
              }`}
            >
              <Send className="w-3.5 h-3.5 stroke-[1.25]" /> E-mail
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] uppercase tracking-wider text-[#77716A] font-medium">
          Votre message *
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Détaillez votre souhait, question ou demande de rendez-vous..."
          className="w-full bg-[#FCFAF7] border border-[#E7E0D7] p-3 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
        />
      </div>

      {status && !status.success && (
        <p className="text-xs text-red-600">{status.msg}</p>
      )}

      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" size="md" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer mon message'}
        </Button>
      </div>
    </form>
  );
}
