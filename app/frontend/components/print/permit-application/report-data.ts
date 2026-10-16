export interface ReportIdentity {
  number?: string
  title?: string
  address?: string
  jurisdiction?: string
  applicant?: string
  tags?: string[]
  template_nickname?: string
  status?: string
  version_number?: number
  submission_version_id?: string
  submitted_at?: string
  exported_at: string
  updated_at?: string
  stage?: string
  checklist_id?: string
}
export interface DigitalSealResult {
  file_id: string
  model_id?: string
  status: "found" | "not_found" | "failed"
  signers: { name?: string; organization?: string; date?: string }[]
}
export type DigitalSealResults = Record<string, DigitalSealResult[]>

export interface ReportData {
  kind: "application" | "part3" | "part9"
  identity: ReportIdentity
  form_json?: Record<string, any>
  submission_data?: { data: Record<string, any> }
  digital_seal_results?: DigitalSealResults
  checklist?: Record<string, any>
  step_code?: Record<string, any>
}
