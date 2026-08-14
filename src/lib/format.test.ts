import { describe, expect, it } from 'vitest'
import { getInitials, getSafeUrl } from './format'

describe('getSafeUrl', () => {
  it('adds https to a plain hostname', () => {
    expect(getSafeUrl('example.com')).toBe('https://example.com/')
  })

  it('rejects non-web protocols', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeNull()
  })

  it('returns null for an empty value', () => {
    expect(getSafeUrl(null)).toBeNull()
  })
})

describe('getInitials', () => {
  it('uses the first two email characters', () => {
    expect(getInitials('alba@example.com')).toBe('AL')
  })
})
