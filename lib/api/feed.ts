import { api } from './client'

export type TipoPost = 'PESSOAL' | 'NEGOCIO' | 'LABORATORIO' | 'PROJETO' | 'EVENTO'

export type TipoReacao = 'LIKE' | 'LOVE' | 'INSIGHTFUL' | 'CURIOUS' | 'CELEBRATE'

export type Visibility = 'public' | 'followers' | 'private'

export type MidiaItem = { url: string; tipo: string; legenda?: string | null }

export type AutorInfo = {
  uid: string
  nome: string
  foto: string | null
  tipo_usuario: string | null
  campus: string | null
  is_verified: boolean
}

export type FeedPost = {
  id: string
  autor_uid: string
  autor: AutorInfo | null
  tipo: TipoPost
  conteudo: string | null
  midia: MidiaItem[] | null
  ref_id: string | null
  ref_tipo: string | null
  visivel: boolean
  visibility: Visibility
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  updated_at: string
}

export type FeedPage = {
  items: FeedPost[]
  next_cursor: string | null
  has_more: boolean
}

export type PostComment = {
  id: string
  post_id: string
  autor_uid: string
  parent_comment_id: string | null
  conteudo: string
  editado: boolean
  replies_count: number
  created_at: string
  updated_at: string
}

export type ApiResp<T> = { message?: string; data: T }

export async function fetchFeed(params: { cursor?: string | null; limit?: number; tipo?: TipoPost } = {}): Promise<FeedPage> {
  const { data } = await api.get<FeedPage>('/api/v1/feed', {
    params: { cursor: params.cursor ?? undefined, limit: params.limit ?? 20, tipo: params.tipo ?? undefined },
  })
  return data
}

export async function createPost(payload: {
  conteudo: string
  tipo?: TipoPost
  visibility?: Visibility
  midia?: MidiaItem[]
  ref_id?: string
}): Promise<FeedPost> {
  const { data } = await api.post<ApiResp<FeedPost>>('/api/v1/feed/posts', {
    tipo: payload.tipo ?? 'PESSOAL',
    conteudo: payload.conteudo,
    visibility: payload.visibility ?? 'public',
    midia: payload.midia,
    ref_id: payload.ref_id,
    visivel: true,
  })
  return data.data
}

export async function uploadPostMedia(file: File): Promise<{ url: string; tipo: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ url: string; tipo: string }>('/api/v1/feed/media', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getPost(postId: string): Promise<FeedPost> {
  const { data } = await api.get<ApiResp<FeedPost>>(`/api/v1/feed/posts/${postId}`)
  return data.data
}

export async function editPost(postId: string, patch: {
  conteudo?: string
  visibility?: Visibility
  midia?: MidiaItem[]
}): Promise<FeedPost> {
  const { data } = await api.patch<ApiResp<FeedPost>>(`/api/v1/feed/posts/${postId}`, patch)
  return data.data
}

export async function deletePost(postId: string): Promise<void> {
  await api.delete(`/api/v1/feed/posts/${postId}`)
}

export async function reactToPost(postId: string, _tipo: TipoReacao = 'LIKE'): Promise<void> {
  await api.post(`/api/v1/like/post/${postId}`)
}

export async function unreactPost(postId: string): Promise<void> {
  await api.delete(`/api/v1/like/post/${postId}`)
}

export async function listComments(postId: string, limit = 5, offset = 0): Promise<PostComment[]> {
  const { data } = await api.get<ApiResp<PostComment[]>>(
    `/api/v1/feed/posts/${postId}/comments`, { params: { limit, offset } },
  )
  return data.data
}

export async function listReplies(postId: string, commentId: string): Promise<PostComment[]> {
  const { data } = await api.get<ApiResp<PostComment[]>>(
    `/api/v1/feed/posts/${postId}/comments/${commentId}/replies`,
  )
  return data.data
}

export async function createComment(postId: string, conteudo: string, parent_comment_id?: string): Promise<PostComment> {
  const { data } = await api.post<ApiResp<PostComment>>(
    `/api/v1/feed/posts/${postId}/comments`, { conteudo, parent_comment_id },
  )
  return data.data
}

export async function sharePost(postId: string, comentario?: string): Promise<void> {
  await api.post(`/api/v1/feed/posts/${postId}/shares`, { comentario })
}

export async function unsharePost(postId: string): Promise<void> {
  await api.delete(`/api/v1/feed/posts/${postId}/shares`)
}

export async function bookmarkPost(postId: string): Promise<void> {
  await api.post(`/api/v1/feed/posts/${postId}/bookmark`)
}

export async function unbookmarkPost(postId: string): Promise<void> {
  await api.delete(`/api/v1/feed/posts/${postId}/bookmark`)
}

export async function fetchUserPosts(uid: string, params: { cursor?: string | null; limit?: number } = {}): Promise<FeedPage> {
  const { data } = await api.get<FeedPage>(`/api/v1/feed/users/${uid}/posts`, {
    params: { cursor: params.cursor ?? undefined, limit: params.limit ?? 20 },
  })
  return data
}

export type EntityFeedTarget = 'negocio' | 'laboratorio' | 'iniciativa' | 'evento'

export async function fetchEntityPosts(
  targetType: EntityFeedTarget,
  targetId: string,
  params: { cursor?: string | null; limit?: number } = {},
): Promise<FeedPage> {
  const { data } = await api.get<FeedPage>(
    `/api/v1/feed/entities/${targetType}/${targetId}/posts`,
    { params: { cursor: params.cursor ?? undefined, limit: params.limit ?? 20 } },
  )
  return data
}

export async function fetchMyBookmarks(limit = 50): Promise<FeedPost[]> {
  const { data } = await api.get<ApiResp<FeedPost[]>>('/api/v1/feed/bookmarks', { params: { limit } })
  return data.data
}
