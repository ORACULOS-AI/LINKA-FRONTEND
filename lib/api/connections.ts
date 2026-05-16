/**
 * Wrappers de compatibilidade sobre o grafo polimórfico de follow (SLK-269 R3).
 *
 * "Conexão" no produto agora é equivalente a "follow mútuo" entre dois usuários.
 * Não há mais request/accept/reject — segue é unilateral, mutualidade é derivada.
 *
 * Para novo código, prefira chamar diretamente os helpers de `lib/api/follow`.
 */
import { api } from './client'
import {
  follow,
  unfollow,
  isFollowing as polyIsFollowing,
  isMutual,
  getFollowersCount,
  getMutualUids,
  listMyFollowing,
  type FollowUser,
} from './follow'

export type ConnectionStatus = 'none' | 'following' | 'connected'

export type ConnectionBetween = {
  status: ConnectionStatus
  i_follow: boolean
  mutual: boolean
}

export type FollowCounts = {
  followers: number
  following: number
}

export type ConnectionUser = {
  uid: string
  nome: string
  foto_url?: string | null
  tipo_usuario?: string
}

export type SuggestedUser = ConnectionUser & {
  campus?: string | null
  mutual_count?: number
}

function toConnectionUser(u: FollowUser): ConnectionUser {
  return {
    uid: u.uid,
    nome: u.nome,
    foto_url: u.foto_perfil ?? null,
    tipo_usuario: u.tipo_usuario,
  }
}

export async function getConnectionBetween(otherUid: string): Promise<ConnectionBetween> {
  const [iFollow, mutual] = await Promise.all([
    polyIsFollowing('user', otherUid),
    isMutual(otherUid),
  ])
  return {
    i_follow: iFollow,
    mutual,
    status: mutual ? 'connected' : iFollow ? 'following' : 'none',
  }
}

export async function followUser(uid: string): Promise<void> {
  await follow('user', uid)
}

export async function unfollowUser(uid: string): Promise<void> {
  await unfollow('user', uid)
}

export async function isFollowing(uid: string): Promise<boolean> {
  return polyIsFollowing('user', uid)
}

/** Mantido por compatibilidade — equivale a `followUser`. */
export async function sendConnectionRequest(toUid: string): Promise<void> {
  await followUser(toUid)
}

/** No-op — pedidos de conexão não existem mais no novo grafo. */
export async function cancelConnectionRequest(_connectionId: string): Promise<void> {
  // intentionally noop
}

export async function acceptConnectionRequest(_connectionId: string): Promise<void> {
  // intentionally noop
}

export async function rejectConnectionRequest(_connectionId: string): Promise<void> {
  // intentionally noop
}

export async function getFollowCounts(uid: string): Promise<FollowCounts> {
  const followers = await getFollowersCount('user', uid)
  let following = 0
  try {
    const list = await listMyFollowing()
    following = list.filter((f) => f.target_type === 'user').length
  } catch {
    following = 0
  }
  return { followers, following }
}

/**
 * "Conexões" do usuário logado = follows mútuos com outros users.
 * Requer o uid próprio do user logado.
 */
export async function getMyConnections(myUid: string): Promise<ConnectionUser[]> {
  const mutualUids = await getMutualUids(myUid)
  if (!mutualUids.length) return []
  const users = await Promise.all(
    mutualUids.map(async (uid) => {
      try {
        const { data } = await api.get<{ data: FollowUser }>(`/api/v1/users/${uid}`)
        return toConnectionUser(data.data)
      } catch {
        return null
      }
    }),
  )
  return users.filter((u): u is ConnectionUser => u !== null)
}

export async function getMyConnectionCount(myUid: string): Promise<number> {
  const uids = await getMutualUids(myUid)
  return uids.length
}

export async function getUserConnections(uid: string): Promise<ConnectionUser[]> {
  return getMyConnections(uid)
}

/**
 * Sugestões de quem seguir — backend ainda não tem endpoint dedicado
 * (`/follow/suggestions` é roadmap). Por ora retorna vazio.
 */
export async function getSuggestions(_limit = 5): Promise<SuggestedUser[]> {
  return []
}

/** Pedidos de conexão não existem mais — retorna vazio. */
export async function getConnectionRequests(
  _type: 'sent' | 'received' | 'all' = 'received',
): Promise<unknown[]> {
  return []
}
