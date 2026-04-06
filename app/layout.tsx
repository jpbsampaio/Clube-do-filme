import AppShell from '@/app/components/app-shell'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="bg-voyeur-black text-voyeur-white">
      <body className="max-w-md mx-auto min-h-screen flex flex-col bg-voyeur-black text-voyeur-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
