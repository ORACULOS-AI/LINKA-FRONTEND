import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const EmptyInitiativesState = () => {
  const router = useRouter()
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <h2 className="text-2xl font-semibold">
        Você ainda não cadastrou nenhuma iniciativa.
      </h2>
      <p className="text-muted-foreground">
        Crie sua primeira iniciativa ou participe de uma existente!
      </p>
      <Button
        className="mt-6 bg-black text-white hover:bg-black/70"
        onClick={() => router.push('/iniciativas/nova')}
      >
        <Plus className="w-4 h-4 mr-2" />
        Cadastrar minha primeira iniciativa
      </Button>
    </div>
  )
} 