'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized'
      ? 'Accès refusé : ce compte ne dispose pas des privilèges administrateur requis.'
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim();

    try {
      const supabase = createClient();

      // 1. Authenticate against Supabase Auth service
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError || !authData.user) {
        setError('Identifiants incorrects ou accès non autorisé.');
        setLoading(false);
        return;
      }

      // 2. Strict authorization: verify auth.users.id exists in `admins` table with `active = true`
      const { data: adminRecord, error: adminError } = await supabase
        .from('admins')
        .select('id, user_id, active, role')
        .eq('user_id', authData.user.id)
        .eq('active', true)
        .maybeSingle();

      if (adminError || !adminRecord) {
        // User account exists in Supabase Auth, but is NOT an active admin in the database
        await supabase.auth.signOut();
        setError('Identifiants incorrects ou accès non autorisé.');
        setLoading(false);
        return;
      }

      // 3. User is a verified active administrator -> Safe redirect
      const destination =
        redirectParam &&
        redirectParam.startsWith('/admin') &&
        !redirectParam.startsWith('//')
          ? redirectParam
          : '/admin';

      router.push(destination);
      router.refresh();
    } catch {
      setError('Une erreur technique est survenue lors de la tentative de connexion.');
      setLoading(false);
    }
  };

  return (
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
            autoComplete="email"
            placeholder="administrateur@perlenoire-joaillerie.fr"
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
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#121212] border border-[#3E3D3A] px-3.5 py-2.5 text-sm text-[#FAF8F5] focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        {error && (
          <div className="p-3 bg-[#2B1B1B] border border-[#552727] text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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
            <span>{loading ? 'Vérification sécurisée...' : 'Déverrouiller l’Administration'}</span>
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t border-[#262624] text-center">
        <p className="text-[10px] text-[#736B5E] uppercase tracking-wider">
          Système protégé • Authentification Supabase Auth active
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#FAF8F5] flex flex-col justify-center items-center px-4 sm:px-6">
      <Suspense fallback={<div className="text-xs text-[#736B5E]">Chargement du portail sécurisé...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
