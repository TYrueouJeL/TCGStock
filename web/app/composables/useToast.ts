export function useToast() {
  const message = useState<string | null>('toast', () => null)
  let timer: ReturnType<typeof setTimeout> | undefined
  function toast(text: string) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = null), 2600)
  }
  return { message, toast }
}
