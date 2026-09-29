import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'À Propos | Perle Noire',
  description:
    'Découvrez l’esprit de nos créations : équilibre des lignes, métaux précieux et passion du détail joaillier.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-[11px] uppercase tracking-eyebrow text-[#77716A] font-light block">
          La Philosophie
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#171717] font-normal leading-tight">
          L’art de la sobriété précieuse
        </h1>
        <div className="w-12 h-px bg-[#B99A64] mx-auto mt-4" />
      </div>

      {/* Main Editorial Text */}
      <div className="space-y-6 text-sm text-[#77716A] font-light leading-relaxed max-w-2xl mx-auto text-center sm:text-left">
        <p className="text-base sm:text-lg text-[#171717] font-normal font-editorial">
          Chaque création est pensée comme une rencontre entre la pureté du dessin contemporain et l’excellence des matières précieuses.
        </p>
        <p>
          Nous privilégions des volumes nets, des finitions minutieuses et un confort de porter irréprochable. Du choix de l’or 18 carats au sertissage délicat de chaque gemme, notre approche privilégie l’intemporalité sur l’éphémère.
        </p>
        <p>
          Nos bijoux sont imaginés pour s’associer avec fluidité, se transmettre et accompagner avec discrétion les instants essentiels de votre quotidien.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#E7E0D7]">
        <div className="p-6 bg-[#F6F1EA] space-y-2">
          <span className="text-[10px] uppercase tracking-eyebrow text-[#77716A] font-medium block">
            01 • Matières
          </span>
          <h3 className="font-editorial text-xl text-[#171717]">Or 18 carats & gemmes</h3>
          <p className="text-xs text-[#77716A] leading-relaxed font-light">
            Une sélection rigoureuse de métaux précieux et de pierres aux teintes profondes et reflets subtils.
          </p>
        </div>

        <div className="p-6 bg-[#F6F1EA] space-y-2">
          <span className="text-[10px] uppercase tracking-eyebrow text-[#77716A] font-medium block">
            02 • Dessin
          </span>
          <h3 className="font-editorial text-xl text-[#171717]">Lignes essentielles</h3>
          <p className="text-xs text-[#77716A] leading-relaxed font-light">
            Une recherche de justesse et d’équilibre dans chaque courbe pour une élégance naturelle et intemporelle.
          </p>
        </div>

        <div className="p-6 bg-[#F6F1EA] space-y-2">
          <span className="text-[10px] uppercase tracking-eyebrow text-[#77716A] font-medium block">
            03 • Attention
          </span>
          <h3 className="font-editorial text-xl text-[#171717]">Service attentionné</h3>
          <p className="text-xs text-[#77716A] leading-relaxed font-light">
            Un accompagnement discret et réactif pour vos demandes spécifiques, conseils et commandes personnalisées.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center pt-4 space-y-6">
        <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717] font-normal">
          Échanger avec nous
        </h2>
        <p className="text-xs sm:text-sm text-[#77716A] max-w-md mx-auto font-light leading-relaxed">
          Pour une question sur une pièce, un conseil de taille ou une création particulière, nous sommes à votre disposition.
        </p>
        <Link href="/contact" className="inline-block">
          <Button variant="primary" size="md">
            Nous contacter
          </Button>
        </Link>
      </div>
    </div>
  );
}
