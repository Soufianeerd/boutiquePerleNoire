'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { submitContactInquiry } from '@/features/contact/actions';
import { Product } from '@/types/database';
import { MessageSquare, Phone, Send, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function InquiryModal({ isOpen, onClose, product }: InquiryModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'phone' | 'email' | 'contact_form'>('whatsapp');
  const [message, setMessage] = useState(
    product
      ? `Bonjour, je souhaiterais des renseignements concernant la création « ${product.name} » (Réf: ${product.sku || 'Atelier'}).`
      : 'Bonjour, je souhaiterais prendre contact avec votre service clientèle.'
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await submitContactInquiry({
      product_id: product?.id || null,
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
    } else {
      setStatus({ success: false, msg: res.error });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      subtitle="Demande d’information"
      title={product ? `Au sujet de : ${product.name}` : 'Nous contacter'}
      maxWidth="md"
    >
      {status?.success ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F6F1EA] flex items-center justify-center text-[#171717]">
            <CheckCircle2 className="w-6 h-6 stroke-[1.25]" />
          </div>
          <h3 className="font-editorial text-2xl text-[#171717]">Demande transmise</h3>
          <p className="text-xs text-[#77716A] max-w-sm mx-auto leading-relaxed font-light">
            {status.msg}
          </p>
          <div className="pt-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {product && (
            <div className="p-3.5 bg-[#F6F1EA] border border-[#E7E0D7] text-xs text-[#171717] flex items-center justify-between">
              <div>
                <span className="font-medium block">{product.name}</span>
                <span className="text-[11px] text-[#77716A]">{product.material_details || 'Joaillerie'}</span>
              </div>
              {product.base_price > 0 && (
                <span className="font-editorial text-sm text-[#171717]">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.base_price)}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom complet *"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Téléphone"
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
              Votre message ou question *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#FCFAF7] border border-[#E7E0D7] p-3 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
            />
          </div>

          {status && !status.success && (
            <p className="text-xs text-red-600">{status.msg}</p>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? 'Transmission...' : 'Envoyer ma demande'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
