import type { User } from '~/types'

export function useAuth() {
  const token = useToken()
  const user = useState<User | null>('user', () => null)
  const api = useApi()

  async function fetchUser() {
    if (!token.value) return null
    const res = await api<{ data: User }>('/account/profile')
    user.value = res.data
    return user.value
  }

  async function login(email: string, password: string) {
    const res = await api<{ data: { user: User; token: string } }>('/auth/login', { method: 'POST', body: { email, password } })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function signup(body: { fullName: string | null; email: string; password: string; passwordConfirmation: string }) {
    const res = await api<{ data: { user: User; token: string } }>('/auth/signup', { method: 'POST', body })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function logout() {
    try {
      await api('/account/logout', { method: 'POST' })
    } catch {}
    token.value = null
    user.value = null
    clearNuxtState(['games', 'lists'])
    await navigateTo('/connexion')
  }

  return { token, user, fetchUser, login, signup, logout }
}
