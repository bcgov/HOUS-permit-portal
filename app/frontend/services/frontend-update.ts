const updateChecks = new WeakMap<Error, Promise<boolean>>()

function applicationEntry(page: Document) {
  for (const script of Array.from(page.querySelectorAll('script[type="module"][src]'))) {
    const src = script.getAttribute("src")
    if (!src) continue

    const url = new URL(src, window.location.origin)
    if (url.origin === window.location.origin && /^\/vite\/assets\/application-[\w-]+\.js$/.test(url.pathname)) {
      return url.pathname
    }
  }
}

async function checkForFrontendUpdate() {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 3000)
  try {
    const currentEntry = applicationEntry(document)
    if (!currentEntry) return false

    const response = await fetch("/", {
      cache: "no-store",
      mode: "same-origin",
      redirect: "error",
      headers: { Accept: "text/html" },
      signal: controller.signal,
    })
    if (!response.ok || !response.headers.get("Content-Type")?.includes("text/html")) return false

    const page = new DOMParser().parseFromString(await response.text(), "text/html")
    const latestEntry = applicationEntry(page)
    return !!latestEntry && latestEntry !== currentEntry
  } catch {
    return false
  } finally {
    window.clearTimeout(timeout)
  }
}

export function listenForFrontendUpdates() {
  window.addEventListener("vite:preloadError", (event) => {
    // Vite also emits this event for exceptions thrown while evaluating a module.
    const { payload } = event as Event & { payload?: unknown }
    if (
      payload instanceof TypeError &&
      /^(Failed to fetch dynamically imported module:|error loading dynamically imported module:|Importing a module script failed\.)(?:\s|$)/.test(
        payload.message
      ) &&
      !updateChecks.has(payload)
    ) {
      updateChecks.set(payload, checkForFrontendUpdate())
    }
  })
}

export function frontendUpdateCheck(error: unknown) {
  return error instanceof Error ? updateChecks.get(error) : undefined
}
