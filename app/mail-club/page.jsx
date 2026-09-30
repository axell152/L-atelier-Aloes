import Link from 'next/link';

export const metadata = { title: "Mail club | L'Atelier Aloès" };

export default function MailClubPage() {
  return (
    <>
      <style>{`
        @keyframes mc-expand {
          from { clip-path: circle(0% at 50% 50%); }
          to   { clip-path: circle(150% at 50% 50%); }
        }
        @keyframes mc-text {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mc-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .mc-overlay { animation: mc-expand 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards; }
        .mc-text    { opacity: 0; animation: mc-text 0.8s ease-out 1s forwards; }
        .mc-back    { opacity: 0; animation: mc-fade 0.6s ease-out 1.8s forwards; }
        @media (prefers-reduced-motion: reduce) {
          .mc-overlay, .mc-text, .mc-back { animation-duration: 0.01s; animation-delay: 0s; }
        }
      `}</style>

      <div className="mc-overlay fixed inset-0 z-[60] bg-[#284231] flex flex-col items-center justify-center gap-8">
        <h1 className="mc-text text-5xl md:text-7xl font-serif font-bold text-white">
          À venir...
        </h1>
        <Link href="/" className="mc-back text-sm font-medium text-white/90 hover:text-white underline underline-offset-4">
          ← Retour à l'accueil
        </Link>
      </div>
    </>
  );
}
