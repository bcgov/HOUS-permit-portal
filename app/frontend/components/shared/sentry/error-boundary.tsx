import { ErrorBoundary } from "@sentry/react"
import React from "react"
import { useTranslation } from "react-i18next"

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <ErrorBoundary
      fallback={
        <main role="alert" style={{ padding: "2rem" }}>
          <h1>{t("sentry.errorTitle")}</h1>
          <p>{t("sentry.errorBody")}</p>
          <button onClick={() => window.location.reload()}>{t("sentry.reload")}</button>
          <p>
            <a href={`mailto:${t("site.contactEmail")}`}>{t("sentry.support")}</a>
          </p>
        </main>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
