import Link from 'next/link';

export default function ComingSoon({ emoji, title, text }) {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
      <div className="text-center space-y-4 py-12 bg-white rounded-3xl border border-[#EFECE6] shadow-xs px-6">
        <span className="text-5xl">{emoji}</span>
        <h1 className="text-4xl font-serif font-bold text-[#4A3B32]">{title}</h1>
        <p className="text-[#6B5B52] max-w-md mx-auto">{text}</p>
        <p className="text-sm font-semibold text-[#5A3E36]">Bientôt disponible</p>
      </div>
      <div className="text-center">
        <Link href="/" className="text-sm font-medium text-[#6B5B52] hover:text-[#5A3E36] transition">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
