import { Button } from '@/components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const EmptyBusinessState = () => {
  const router = useRouter()
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <h2 className="text-2xl font-semibold">
        Você ainda não tem nenhum negócio cadastrado
      </h2>
      <p className="text-muted-foreground text-center">
        Para começar, você precisa ter um negócio cadastrado.
      </p>

      <Button
        className="mt-6 bg-black text-white hover:bg-black/70"
        onClick={() => router.push('/meus-negocios')}
      >
        <Building2 className="w-4 h-4 mr-2" />
        Cadastrar meu negócio
      </Button>
    </div>
  )
} 