const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/**
 * Formats an ISO date for display. Invalid values render as an empty string so
 * a malformed frontmatter date cannot break the page.
 */
export function formatDate(value: string | Date): string {
  const date = value instanceof Date
    ? value
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return DATE_FORMATTER.format(date)
}
