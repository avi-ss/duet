export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return localStorage.getItem('duet-language') === 'en'
    ? 'Something unexpected happened. Please try again.'
    : 'Ha ocurrido algo inesperado. Inténtalo de nuevo.'
}
