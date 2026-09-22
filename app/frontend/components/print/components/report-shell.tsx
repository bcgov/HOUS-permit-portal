import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "../styles/report.css"
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
  const [portal] = useState(() => {
    const node = document.createElement("div")
    node.className = "print-report-portal"
    return node
  })
  const [ready, setReady] = useState(false)
  const [assetError, setAssetError] = useState<string>()
  const documentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.body.appendChild(portal)
    return () => {
      portal.remove()
    }
  }, [portal])
  useEffect(() => {
    let cancelled = false
    setReady(false)
    setAssetError(undefined)
    if (loading || error || !children) return
    const wait = async () => {
      await document.fonts.ready
      await Promise.all(Array.from(documentRef.current?.querySelectorAll("img") || []).map((img) => img.decode()))
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
  return createPortal(
    <main className="print-report">
      <div className="report-toolbar">
        <div>
          <strong>Print preview · Saved data</strong>
          <p className="report-note">Letter paper (8.5 × 11 in) · Pages are split in Print / Save as PDF.</p>
        </div>
        <button disabled={!ready || !!failure} onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
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
    </main>,
    portal
  )
}
