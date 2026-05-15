import Image from 'next/image'

export default function EntrarPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/selinka/pattern-mint-on-purple.png')" }}
    >
      <div className="w-full max-w-md rounded-xl bg-paper p-8 shadow-2">
        <Image
          src="/selinka/logo-selinka.png"
          alt="Linka"
          width={120}
          height={36}
          priority
          className="mb-6"
        />
        <h1 className="font-display text-2xl font-semibold">Entrar na Linka</h1>
        <p className="mt-2 text-sm text-ink/70">
          A tela de autenticação será implementada em SLK-246 (F2 — Auth &amp; Onboarding).
        </p>
      </div>
    </main>
  )
}
