import { useUserApi } from '@/lib/api/users'

export function useAllUsers() {
  const { useFetchUsers } = useUserApi()
  return useFetchUsers()
}
