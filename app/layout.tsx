import './globals.css'
import Image from 'next/image'

const GOOGLE_DRIVE_URL = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="bg-voyeur-black text-voyeur-white">
      <body className="max-w-md mx-auto min-h-screen flex flex-col border-x border-voyeur-white/5 bg-voyeur-black text-voyeur-white">
        <header className="p-6 pb-4 flex flex-col items-center gap-4">
          <Image 
            src="/voyeurs.jpg"
            alt="Voyeurs Logo" 
            width={80} 
            height={80} 
          />
          <h1 className="text-2xl font-serif tracking-widest uppercase">Voyeurs</h1>
        </header>
        
        <main className="flex-1 px-4 pb-28">
          {children}
        </main>

        <nav className="fixed bottom-0 max-w-md w-full bg-voyeur-black/95 border-t border-voyeur-white/10 px-3 py-3 backdrop-blur">
          <ul className="grid grid-cols-5 gap-2 text-[11px] font-semibold uppercase tracking-tight text-zinc-300">
            <li>
              <a href="#sessao" className="block text-center py-2 rounded-xl bg-voyeur-gray">Sessão</a>
            </li>
            <li>
              <a href="#filmes" className="block text-center py-2 rounded-xl bg-voyeur-gray">Filmes</a>
            </li>
            <li>
              <a href="#votacao" className="block text-center py-2 rounded-xl bg-voyeur-gray">Voto</a>
            </li>
            <li>
              <a href="#historico" className="block text-center py-2 rounded-xl bg-voyeur-gray">Histórico</a>
            </li>
            <li>
              <a href={GOOGLE_DRIVE_URL} target="_blank" rel="noopener noreferrer" className="block text-center py-2 rounded-xl bg-white text-black">Fotos</a>
            </li>
          </ul>
        </nav>
      </body>
    </html>
  )
}