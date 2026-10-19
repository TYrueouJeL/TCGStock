const PUBLIC = ['/connexion', '/inscription']

export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchUser } = useAuth()
  if (PUBLIC.includes(to.path)) {
    if (token.value) return navigateTo('/')
    return
  }
  if (!token.value) return navigateTo('/connexion')
  if (!user.value) {
    try {
      await fetchUser()
    } catch {
      token.value = null
      return navigateTo('/connexion')
    }
  }
})
