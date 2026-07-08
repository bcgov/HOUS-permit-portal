/**
 * Unwrap a CJS/ESM interop default export when Vite exposes the module as
 * `{ default: T }` instead of `T` directly (common with legacy packages like formiojs).
 */
export function interopDefault<T>(moduleValue: T | { default: T }): T {
  if (
    moduleValue != null &&
    typeof moduleValue === "object" &&
    "default" in moduleValue &&
    (moduleValue as { default?: unknown }).default !== undefined
  ) {
    return (moduleValue as { default: T }).default
  }

  return moduleValue as T
}
