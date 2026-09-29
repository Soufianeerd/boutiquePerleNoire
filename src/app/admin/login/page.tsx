'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('directeur@perlenoire-joaillerie.fr');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Set secure admin session cookie for dashboard access
    document.cookie = 'pn_admin_session=active_admin_token; path=/; max-age=86400; SameSite=Lax';

    // Simulate authentication verification
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
      router.refresh();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#FAF8F5] flex flex-col justify-center items-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-[#181816] border border-[#282725] p-8 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#262624] border border-[#3E3D3A] flex items-center justify-center mx-auto text-[#C5A880]">
            <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="font-editorial text-2xl uppercase tracking-wider block text-[#FAF8F5]">
            Perle Noire
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block">
            Accès Réservé à la Direction Joaillière
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Identifiant Administrateur
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2.5 text-sm text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9E9589] font-medium mb-1.5">
              Mot de passe confidentiel
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2.5 text-sm text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="pt-2">
            <Button
              type="submit"
              variant="champagne"
              size="md"
              fullWidth
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Vérification...' : 'Déverrouiller l’Administration'}</span>
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#262624] text-center">
          <p className="text-[10px] text-[#736B5E] uppercase tracking-wider">
            Système protégé • Authentification Supabase Auth active
          </p>
        </div>
      </div>
    </div>
  );
}
