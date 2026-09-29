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
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#A08154]">
          <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="font-editorial text-2xl text-[#141414]">Votre message a été transmis</h3>
        <p className="text-xs sm:text-sm text-[#554E45] max-w-md mx-auto leading-relaxed">
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
        <h2 className="font-editorial text-2xl text-[#141414]">
          Formulaire de Correspondance Privée
        </h2>
        <p className="text-xs text-[#736B5E] mt-1">
          Renseignez vos coordonnées, notre concierge vous répondra personnellement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Votre Nom & Prénom *"
          placeholder="Ex: Mme Claire de Latour"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Votre Adresse E-mail *"
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
          placeholder="+33 6 12 34 56 78"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
            Canal privilégié de réponse
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={`py-2 text-[11px] border transition-colors flex items-center justify-center gap-1 ${
                channel === 'whatsapp'
                  ? 'border-[#141414] bg-[#141414] text-[#FAF8F5]'
                  : 'border-[#DDD5C7] bg-[#FAF8F5] text-[#554E45] hover:border-[#141414]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setChannel('phone')}
              className={`py-2 text-[11px] border transition-colors flex items-center justify-center gap-1 ${
                channel === 'phone'
                  ? 'border-[#141414] bg-[#141414] text-[#FAF8F5]'
                  : 'border-[#DDD5C7] bg-[#FAF8F5] text-[#554E45] hover:border-[#141414]'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Appel
            </button>
            <button
              type="button"
              onClick={() => setChannel('email')}
              className={`py-2 text-[11px] border transition-colors flex items-center justify-center gap-1 ${
                channel === 'email'
                  ? 'border-[#141414] bg-[#141414] text-[#FAF8F5]'
                  : 'border-[#DDD5C7] bg-[#FAF8F5] text-[#554E45] hover:border-[#141414]'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> E-mail
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] uppercase tracking-wider text-[#554E45] font-medium">
          Détail de votre demande ou souhait de rendez-vous *
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: Je souhaiterais réserver une visite pour essayer un solitaire et discuter d'une création sur-mesure..."
          className="w-full bg-[#FAF8F5] border border-[#DDD5C7] p-3 text-sm text-[#141414] focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
        />
      </div>

      {status && !status.success && (
        <p className="text-xs text-red-600">{status.msg}</p>
      )}

      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" size="md" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Transmettre à l’Atelier'}
        </Button>
      </div>
    </form>
  );
}
