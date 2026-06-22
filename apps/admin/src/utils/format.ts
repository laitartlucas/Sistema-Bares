export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatTimeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  return `${hours}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`
}

export function elapsedMinutes(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}
