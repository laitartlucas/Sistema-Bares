export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  return formatDate(dateStr)
}

/**
 * Normaliza telefone para armazenamento: somente dígitos, sem código do país.
 * Remove "+55" ou "55" do início se o número tiver mais de 11 dígitos.
 * Exemplos:
 *   "+55 54 99925-8389" → "54999258389"  (correto)
 *   "54 99925-8389"     → "54999258389"  (correto)
 *   "55 99925-8389"     → "55999258389"  (DDD 55, correto)
 *   "+55 55 99925-8389" → "55999258389"  (DDD 55 com código do país, correto)
 */
export function sanitizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  // Remove "55" do país apenas quando o número tem mais de 11 dígitos
  if (digits.startsWith('55') && digits.length > 11) {
    return digits.slice(2).slice(0, 11)
  }
  return digits.slice(0, 11)
}
