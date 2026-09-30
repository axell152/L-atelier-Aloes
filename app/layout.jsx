import './globals.css';
import SiteHeader from '../components/SiteHeader';
export const metadata = {
  metadataBase: new URL('https://l-atelier-aloes-umber.vercel.app'),
  title: "L'Atelier Aloès | Créations artisanales",
  description: 'Personnalisation, bijoux, aquarelle, couture et mail club : créations uniques faites main.',
  openGraph: {
    title: "L'Atelier Aloès | Créations artisanales",
    description: 'Personnalisation, bijoux, aquarelle, couture et mail club : créations uniques faites main.',
    images: ['/logo.png'],
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#4A3B32] antialiased selection:bg-[#E8A598] selection:text-white">
        
        <SiteHeader />
        {/* Contenu principal */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
          {children}
        </main>
        {/* Pied de page */}
        <footer className="bg-[#F7F4EE] border-t border-[#EFECE6] py-10 text-center text-xs text-[#8C7A70] space-y-4">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/latelieraloes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-[#5A3E36] hover:bg-[#5A3E36] hover:text-white transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/1HirgTb1fH/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-[#5A3E36] hover:bg-[#5A3E36] hover:text-white transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
              </svg>
            </a>
          </div>
          <p>© {new Date().getFullYear()} L'Atelier Aloès </p>
        </footer>
      </body>
    </html>
  );
}
