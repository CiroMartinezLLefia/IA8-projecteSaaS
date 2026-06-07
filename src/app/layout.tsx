import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLIURAMENTS // SaaS de l'assignatura",
  description: "Plataforma col·laborativa de lliuraments de projectes del curs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="ca"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100 font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-black tracking-widest text-white">
                  LLIURAMENTS<span className="text-emerald-500 font-bold">//</span>SaaS
                </span>
              </Link>
              {user && user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-950 px-2.5 py-1 rounded bg-emerald-950/20 hover:bg-emerald-950/50 hover:text-emerald-300 transition-colors"
                >
                  Panell Administració
                </Link>
              )}
            </div>

            <nav className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3 sm:gap-4">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="sm:hidden text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      Admin
                    </Link>
                  )}
                  <div className="flex flex-col text-right hidden xs:flex">
                    <span className="text-sm font-medium text-zinc-200">
                      {user.name}
                    </span>
                    <div className="flex gap-1 justify-end items-center">
                      <span className={`text-[10px] uppercase font-mono px-1 rounded ${
                        user.role === "ADMIN" 
                          ? "bg-purple-950/50 text-purple-400 border border-purple-900" 
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                      }`}>
                        {user.role}
                      </span>
                      {user.role === "STUDENT" && (
                        <span className={`text-[10px] uppercase font-mono px-1 rounded ${
                          user.status === "VALIDATED" 
                            ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900" 
                            : "bg-amber-950/50 text-amber-400 border border-amber-900"
                        }`}>
                          {user.status === "VALIDATED" ? "Validat" : "Pendent"}
                        </span>
                      )}
                    </div>
                  </div>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900"
                    >
                      Sortir
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded text-zinc-400 hover:text-white transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
                  >
                    Registrar-se
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          {children}
        </main>

        <footer className="w-full border-t border-zinc-900 py-6 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
            <span>
              &copy; 2026 Plataforma SaaS de Lliuraments del Curs. Tot en Català.
            </span>
            <div className="flex items-center gap-4">
              <span>M0612 // M0613 // M0615</span>
              <span className="text-emerald-500 font-bold font-mono">IA8 PROJ</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
