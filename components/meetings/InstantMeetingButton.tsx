import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useMeetingApi, InstantMeetingCreate } from '@/lib/api/meetings'
import { useAuth } from '@/lib/context/AuthContext'

interface InstantMeetingButtonProps {
  participantId?: string | null // se null => cria consigo mesmo
  duration?: number // minutos
  trigger?: React.ReactNode
}

export default function InstantMeetingButton({
  participantId,
  duration = 60,
  trigger,
}: InstantMeetingButtonProps) {
  const { useCreateInstantMeeting } = useMeetingApi()
  const createMut = useCreateInstantMeeting()
  const router = useRouter()
  const { userId } = useAuth()

  const handleClick = () => {
    const payload: InstantMeetingCreate = {
      participant_id: participantId || userId,
      duration_minutes: duration,
    }
    createMut.mutate(payload, {
      onSuccess: (meeting) => {
        router.push(`/reunioes/${meeting.id}`)
      },
    })
  }

  return (
    <Button onClick={handleClick} disabled={createMut.isPending} variant="secondary">
      {trigger || (createMut.isPending ? 'Criando...' : 'Iniciar agora')}
    </Button>
  )
} 