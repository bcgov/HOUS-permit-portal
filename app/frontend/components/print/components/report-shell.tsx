import React, { useEffect, useRef, useState } from "react"
import "../styles/print.css"
import "../styles/tokens.css"

export class ReportErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean; message: string }
> {
  state = { error: false, message: "" }
  static getDerivedStateFromError(error: Error) {
    return { error: true, message: error.message }
  }
  render() {
    return this.state.error ? (
      <ReportShell
        error={`This report could not be rendered. No printable record was produced.${import.meta.env.DEV ? " " + this.state.message : ""}`}
      />
    ) : (
      this.props.children
    )
  }
}
export function ReportShell({
  children,
  error,
  loading = false,
}: {
  children?: React.ReactNode
  error?: string
  loading?: boolean
}) {
  const [ready, setReady] = useState(false)
  const [assetError, setAssetError] = useState<string>()
  const documentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false
    setReady(false)
    setAssetError(undefined)
    if (loading || error || !children) return
    const wait = async () => {
      if (document.documentElement.dataset.reportAssets === "packaged") {
        for (const weight of [400, 700]) {
          const faces = await document.fonts.load(`${weight} 11pt "BC Sans"`)
          if (!faces.length || faces.some((face) => face.status !== "loaded"))
            throw new Error("Required font unavailable")
        }
      }
      await document.fonts.ready
      // Let footer preparation finish with the loaded font before decoding its image.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      await Promise.all(Array.from(documentRef.current?.querySelectorAll("img") || []).map((img) => img.decode()))
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      // Measure at the actual Letter content width after fonts/images settle. Oversized
      // blocks must flow immediately, rather than waste a page trying to stay together.
      const reportElement = documentRef.current
      if (reportElement) {
        const ruler = window.document.createElement("div")
        ruler.className = "report-page-measure"
        reportElement.appendChild(ruler)
        const pageHeight = ruler.getBoundingClientRect().height
        ruler.remove()
        reportElement
          .querySelectorAll<HTMLElement>(
            ".report-field, .report-field-pair, .report-record, .report-summary, .report-columns, .report-keep, .report-table, tr"
          )
          .forEach((block) => {
            block.classList.toggle("report-fragmentable", block.getBoundingClientRect().height > pageHeight - 24)
          })
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }
    const timer = window.setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        setAssetError("Report assets did not finish loading. Reload to try again.")
      }
    }, 30000)
    wait()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setAssetError("A required report image or font could not be loaded.")
      })
      .finally(() => clearTimeout(timer))
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [children, loading, error])
  const failure = error || assetError
  useEffect(() => {
    if (document.documentElement.dataset.reportAssets !== "packaged") return
    document.documentElement.dataset.reportState = failure ? "error" : ready ? "ready" : "loading"
    return () => {
      delete document.documentElement.dataset.reportState
    }
  }, [ready, failure])
  return (
    <main className="print-report">
      <div className="report-document" ref={documentRef}>
        {failure ? (
          <div role="alert" className="report-error">
            {failure}
          </div>
        ) : loading ? (
          <p role="status">Loading report…</p>
        ) : (
          children
        )}
        {ready && !failure && <span id="print-ready" aria-hidden="true" />}
      </div>
    </main>
  )
}
