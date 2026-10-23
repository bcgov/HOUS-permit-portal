import * as Sentry from "@sentry/react"
import { reaction } from "mobx"
import { feedbackOptions } from "./feedback-appearance"
import { feedbackController } from "./feedback-controller"
import { privateTransport, roles, uuid } from "./privacy"

export { feedbackController }

export function initializeSentry() {
  let config: { enabled?: boolean; feedbackEnabled?: boolean; dsn?: string; environment?: string; release?: string }
  try {
    config = JSON.parse(document.querySelector('meta[name="sentry-config"]')?.getAttribute("content") ?? "{}")
  } catch {
    return
  }
  if (config?.enabled !== true) return
  const feedback = Sentry.feedbackIntegration(feedbackOptions())
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    transport: (options) =>
      privateTransport(
        Sentry.makeFetchTransport({
          ...options,
          fetchOptions: { ...options.fetchOptions, referrerPolicy: "no-referrer", credentials: "omit" },
        }),
        window.location.origin,
        (eventId, userId) => feedbackController.crash(eventId, userId)
      ),
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
      frameContextLines: 0,
      databaseQueryData: false,
      queues: false,
    },
    sendClientReports: false,
    // No Replay, tracing, session, log or metric integrations are installed.
    defaultIntegrations: false,
    integrations: [
      Sentry.globalHandlersIntegration(),
      Sentry.browserApiErrorsIntegration(),
      Sentry.dedupeIntegration(),
      ...(config.feedbackEnabled ? [feedback] : []),
    ],
    beforeBreadcrumb: () => null,
  })
}

export function setSentryUser(user?: { id: string; role: string }) {
  if (Sentry.getIsolationScope().getUser().id !== user?.id) feedbackController.close()
  Sentry.setUser(user ? { id: user.id } : null)
  Sentry.setTag("role", user?.role)
}

export function observeSentryUser(rootStore: any) {
  return reaction(
    () => {
      const session = rootStore.sessionStore
      const user =
        session.loggedIn && !session.tokenExpired && !session.isLoggingOut ? rootStore.userStore.currentUser : undefined
      return { id: user?.id, role: user?.role }
    },
    ({ id, role }) => {
      const user = uuid.test(id ?? "") && roles.includes(role) ? { id, role } : undefined
      if (Sentry.isInitialized()) setSentryUser(user)
    },
    { fireImmediately: true, equals: (a, b) => a.id === b.id && a.role === b.role }
  )
}
