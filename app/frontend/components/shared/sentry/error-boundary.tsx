import { ErrorBoundary } from "@sentry/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { frontendUpdateCheck } from "../../../services/frontend-update"

function AppErrorFallback({ error }: { error: unknown }) {
  const { t } = useTranslation()
  const updateCheck = frontendUpdateCheck(error)
  const [updated, setUpdated] = useState<boolean>()

  useEffect(() => {
    let active = true
    updateCheck?.then((result) => {
      if (active) setUpdated(result)
    })
    return () => {
      active = false
    }
  }, [updateCheck])

  const checking = !!updateCheck && updated === undefined

  return (
    <main role="alert" style={{ padding: "2rem" }}>
      <h1>{t(updated ? "sentry.updateTitle" : checking ? "sentry.loadErrorTitle" : "sentry.errorTitle")}</h1>
      {!checking && <p>{t(updated ? "sentry.updateBody" : "sentry.errorBody")}</p>}
      <button type="button" onClick={() => window.location.reload()}>
        {t("sentry.reload")}
      </button>
      {!checking && !updated && (
        <p>
          <a href={`mailto:${t("site.contactEmail")}`}>{t("sentry.support")}</a>
        </p>
      )}
    </main>
  )
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={AppErrorFallback}>{children}</ErrorBoundary>
}
