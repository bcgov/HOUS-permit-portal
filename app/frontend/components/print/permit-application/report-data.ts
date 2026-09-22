export interface ReportIdentity {
  number?: string
  title?: string
  address?: string
  status?: string
  version_number?: number
  submission_version_id?: string
  submitted_at?: string
  exported_at: string
  updated_at?: string
  stage?: string
  checklist_id?: string
}
export interface ReportData {
  kind: "application" | "part3" | "part9"
  identity: ReportIdentity
  form_json?: Record<string, any>
  submission_data?: { data: Record<string, any> }
  checklist?: Record<string, any>
  step_code?: Record<string, any>
}
/** Preserve FormIO schema keys exactly; the normal API camelizer rewrites nested schema keys. */
export async function fetchReportData(endpoint: string, signal: AbortSignal): Promise<ReportData> {
  const sandbox = JSON.parse(localStorage.getItem("SandboxStore") || "null")?.currentSandboxId
  const response = await fetch(`/api/${endpoint}`, {
    credentials: "same-origin",
    signal,
    cache: "no-store",
    headers: sandbox ? { "X-Sandbox-ID": sandbox } : {},
  })
  if (!response.ok) {
    const failure = await response.json().catch(() => ({}))
    throw new Error(
      response.status === 403
        ? "You do not have access to this report."
        : failure.error || "The requested report or saved snapshot is unavailable."
    )
  }
  const { data } = await response.json()
  return data
}
