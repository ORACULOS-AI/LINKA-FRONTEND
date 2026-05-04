import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center text-center gap-6">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
          Página não encontrada
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
      </div>

      <div className="my-12">
        <Image
          src="/404.svg"
          alt="Ilustração 404"
          width={300}
          height={300}
          priority
        />
      </div>

      <Link 
        href="/"
        className="px-8 py-4 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors font-medium"
      >
        Voltar para a página inicial
      </Link>
    </div>
  )
} 