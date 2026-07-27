import dayjs, { type Dayjs } from 'dayjs'

/** '2026-05-12' → '12 de Mayo, 2026' (mes capitalizado, locale es). */
export function formatLongDate(date: string | Dayjs = dayjs()): string {
  const formatted = dayjs(date).format('D [de] MMMM, YYYY')
  return formatted.replace(/de (\w)/, (_, c: string) => `de ${c.toUpperCase()}`)
}
