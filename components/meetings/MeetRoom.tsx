// @ts-ignore
import dynamic from 'next/dynamic'
const LiveKitRoom = dynamic(() => import('@livekit/components-react').then(m => m.LiveKitRoom), { ssr: false });
// @ts-ignore
const VideoConference = dynamic(() => import('@livekit/components-react').then(m => m.VideoConference), { ssr: false });
import { useEffect, useState, useCallback } from 'react'
import { useMeetingApi, WebRTCTokenResponse } from '@/lib/api/meetings'
// @ts-ignore
const PreJoin = dynamic(() => import('@livekit/components-react').then(m => m.PreJoin), { ssr: false });
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'

interface MeetRoomProps {
  meetingId: string
}

interface PreJoinValues {
  username: string
  videoEnabled: boolean
  audioEnabled: boolean
}

export default function MeetRoom({ meetingId }: MeetRoomProps) {
  const { getWebRTCToken } = useMeetingApi()
  const [cfg, setCfg] = useState<WebRTCTokenResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [roomState, setRoomState] = useState<'prejoin' | 'connecting' | 'connected' | 'disconnected'>('prejoin')
  const [preJoinValues, setPreJoinValues] = useState<PreJoinValues | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    setError(null)
    
    getWebRTCToken(meetingId)
      .then((data) => {
        if (!mounted) return
        setCfg(data)
      })
      .catch((err: any) => {
        if (!mounted) return
        setError(err.message || 'Falha ao conectar')
      })
      
    return () => {
      mounted = false
    }
  }, [meetingId])

  const handlePreJoinSubmit = useCallback((values: PreJoinValues) => {
    setPreJoinValues(values)
    setRoomState('connecting')
    
    // Pequeno delay para garantir que o estado seja atualizado
    setTimeout(() => {
      setRoomState('connected')
    }, 100)
  }, [])

  const handlePreJoinError = useCallback((error: any) => {
    setError(error.message || 'Erro no pré-ingresso')
  }, [])

  const handleDisconnected = useCallback(() => {
    setRoomState('disconnected')
    setIsReconnecting(false)
  }, [])

  const handleReconnect = useCallback(() => {
    setIsReconnecting(true)
    setRoomState('connecting')
    setTimeout(() => {
      setRoomState('connected')
      setIsReconnecting(false)
    }, 100)
  }, [])

  const handleLeaveRoom = useCallback(() => {
    setRoomState('prejoin')
    setPreJoinValues(null)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h2 className="text-xl font-semibold mb-4">Erro de Conexão</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!cfg) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando sala de reunião...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Estado: PreJoin */}
      {roomState === 'prejoin' && (
        <div className="flex items-center justify-center w-full h-screen">
          <PreJoin
            data-lk-theme="default"
            defaults={{ 
              username: user?.nome || user?.email || 'Usuário',
              videoEnabled: preJoinValues?.videoEnabled ?? true,
              audioEnabled: preJoinValues?.audioEnabled ?? true
            }}
            onError={handlePreJoinError}
            onSubmit={handlePreJoinSubmit}
          />
        </div>
      )}

      {/* Estado: Conectando */}
      {roomState === 'connecting' && (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>{isReconnecting ? 'Reconectando...' : 'Entrando na reunião...'}</p>
          </div>
        </div>
      )}

      {/* Estado: Conectado */}
      {roomState === 'connected' && preJoinValues && (
        <div className="w-full h-screen">
          <LiveKitRoom
            token={cfg.token}
            serverUrl={cfg.url}
            connect={true}
            data-lk-theme="default"
            video={preJoinValues.videoEnabled}
            audio={preJoinValues.audioEnabled}
            style={{ width: '100%', height: '100%' }}
            onDisconnected={handleDisconnected}
            onError={(error) => {
              setError(error.message || 'Erro na sala de reunião')
            }}
          >
            <VideoConference />
          </LiveKitRoom>
        </div>
      )}

      {/* Estado: Desconectado */}
      {roomState === 'disconnected' && (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="text-center text-white p-6">
            <h2 className="text-xl font-semibold mb-4">Desconectado</h2>
            <p className="mb-6">Você foi desconectado da reunião.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReconnect} className="bg-green-600 hover:bg-green-700">
                Reconectar
              </Button>
              <Button onClick={handleLeaveRoom} variant="outline">
                Sair da Reunião
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 