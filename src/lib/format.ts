export function formatDate(date: string, locale = 'es-ES') {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

export function getGreeting(language: 'es' | 'en' = 'es') {
  const hour = new Date().getHours()
  if (language === 'en') {
    if (hour < 13) return 'Good morning'
    if (hour < 20) return 'Good afternoon'
    return 'Good evening'
  }
  if (hour < 13) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function getSafeUrl(url: string | null) {
  if (!url) return null

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}

export function getInitials(email?: string) {
  if (!email) return 'D'
  return email.slice(0, 2).toUpperCase()
}
