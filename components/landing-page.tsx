import Link from "next/link"
import type { JSX } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Network, Gem, Newspaper, Sparkles, Users, Rocket } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-animated-gradient text-white font-sans overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Slow moving gradient layers */}
        <div className="absolute inset-0 bg-gradient-moving opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-moving-reverse opacity-60"></div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full animate-slow-spin"></div>

        {/* Additional moving elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-diagonal animate-diagonal-move opacity-30"></div>
      </div>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 flex items-center justify-center text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"></div>
          <div className="container px-4 md:px-6 relative z-10">
            {/* UFC Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 backdrop-blur-sm mb-8 group hover:from-purple-600/30 hover:to-violet-600/30 transition-all duration-300">
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Universidade Federal do Ceará</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-white via-purple-200 to-violet-300 bg-clip-text text-transparent leading-tight">
              Conectando Inovação e Oportunidades
            </h1>

            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              A Linka é sua plataforma para encontrar, colaborar e impulsionar iniciativas inovadoras. Explore um
              ecossistema de criatividade e crescimento.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard"
                className="group relative inline-flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-purple-500/25 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden"
                prefetch={false}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <span className="relative z-10">Explorar Ecossistema</span>
              </Link>

              <Link
                href="/login"
                className="group relative inline-flex h-12 items-center justify-center rounded-lg border border-purple-500/50 bg-transparent px-8 text-sm font-semibold text-purple-200 shadow-sm transition-all duration-300 hover:bg-purple-500/10 hover:border-purple-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 backdrop-blur-sm"
                prefetch={false}
              >
                <span className="relative z-10">Quero me conectar!</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/50 to-transparent"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/10 to-violet-600/10 border border-purple-500/20 backdrop-blur-sm mb-6">
              <Rocket className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Recursos</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
              Tudo que você precisa para inovar
            </h2>

            <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-12">
              Nossa plataforma oferece uma gama de ferramentas para conectar empreendedores, pesquisadores e
              investidores.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Network className="h-10 w-10 text-purple-400" />}
                title="Rede de Conexões"
                description="Amplie sua rede de contatos com profissionais e empresas inovadoras."
              />
              <FeatureCard
                icon={<Gem className="h-10 w-10 text-violet-400" />}
                title="Vitrine de Iniciativas"
                description="Exponha seus projetos e encontre as oportunidades certas para crescer."
              />
              <FeatureCard
                icon={<Newspaper className="h-10 w-10 text-purple-400" />}
                title="Eventos Exclusivos"
                description="Participe de eventos, workshops e palestras com os maiores nomes do mercado."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-violet-900/30 to-purple-900/30"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
                Pronto para inovar?
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Junte-se à comunidade de inovadores da UFC e transforme suas ideias em realidade.
              </p>
              <Link
                href="/login"
                className="group relative inline-flex h-14 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-12 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-purple-500/25 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden"
                prefetch={false}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <span className="relative z-10">Começar Agora - Gratuito</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: JSX.Element
  title: string
  description: string
}) => (
  <div className="group relative p-8 bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-500/30">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
)

const TestimonialCard = ({
  name,
  role,
  message,
  avatarFallback,
}: {
  name: string
  role: string
  message: string
  avatarFallback: string
}) => (
  <Card className="group relative p-8 bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm text-left shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 hover:border-purple-400/40">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <CardHeader className="flex items-center gap-4 p-0 mb-6 relative z-10">
      <Avatar className="ring-2 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300">
        <AvatarImage src="/placeholder-user.jpg" alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-violet-600 text-white font-semibold">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">{name}</p>
        <p className="text-sm text-purple-300">{role}</p>
      </div>
    </CardHeader>
    <CardContent className="p-0 relative z-10">
      <p className="text-gray-300 italic leading-relaxed">"{message}"</p>
    </CardContent>
  </Card>
)
