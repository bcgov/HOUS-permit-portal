import i18next from "i18next"
/** Report labels include schema/domain values selected at runtime. */
export function reportTranslation(key: string, options?: Record<string, any>): string {
  if (key.endsWith(".undefined") || key.endsWith(".null") || key.endsWith(".")) return "-"
  return i18next.t(key as any, options as any) as string
}
