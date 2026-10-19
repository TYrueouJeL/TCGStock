import type { $Fetch, FetchError } from 'ofetch'

export const useToken = () => useCookie<string | null>('tcg_token', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 60 })

/**
 * $fetch bound to the AdonisJS API, with the user's token.
 * A 401 sends the user back to the login page. Typed as a plain ofetch
 * client: the API is not a Nitro server, so Nuxt's route typing only slows
 * the type checker down.
 */
export function useApi(): $Fetch {
  const config = useRuntimeConfig()
  const token = useToken()
  return $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      if (token.value) options.headers.set('Authorization', `Bearer ${token.value}`)
      options.headers.set('Accept', 'application/json')
    },
    onResponseError({ response }) {
      if (response.status === 401 && token.value) {
        token.value = null
        navigateTo('/connexion')
      }
    },
  }) as unknown as $Fetch
}

export type ApiProblem = { message: string; fields: Record<string, string> }

/** Turns an API error into a sentence plus per-field messages. */
export function apiProblem(error: unknown): ApiProblem {
  const e = error as FetchError
  const errors: { field?: string; message: string }[] = e?.data?.errors ?? []
  const fields: Record<string, string> = {}
  for (const err of errors) if (err.field && !fields[err.field]) fields[err.field] = err.message
  if (!e?.response) return { message: 'Le serveur ne répond pas. Vérifie que l’API est lancée.', fields }
  if (errors.length && !Object.keys(fields).length) return { message: errors[0]!.message, fields }
  if (Object.keys(fields).length) return { message: 'Certains champs sont à corriger.', fields }
  if (e.response.status === 404) return { message: 'Élément introuvable. Il a peut-être été supprimé.', fields }
  return { message: 'Une erreur est survenue. Réessaie.', fields }
}
