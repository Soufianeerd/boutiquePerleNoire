import React from 'react';
import { AlertTriangle, Database } from 'lucide-react';

interface Props {
  message?: string;
}

export function DatabaseNotConfiguredBanner({ message }: Props) {
  return (
    <div className="bg-[#261C14] border border-[#6B4725] p-4 flex items-start gap-3 text-amber-200">
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2 font-medium text-amber-300">
          <Database className="w-3.5 h-3.5" />
          <span>Base de données non configurée</span>
        </div>
        <p className="text-amber-200/80 leading-relaxed">
          {message ||
            'Les clés Supabase ne sont pas renseignées dans .env.local (ou contiennent des valeurs de substitution). Aucune donnée fictive n’est simulée dans l’administration. Veuillez connecter votre instance PostgreSQL Supabase pour activer la persistance réelle.'}
        </p>
      </div>
    </div>
  );
}
