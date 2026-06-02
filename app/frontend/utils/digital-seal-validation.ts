import { vancouverTimeZone } from "../constants"

export const DIGITAL_SEAL_VALIDATOR_UPLOAD_ENDPOINT = "/api/digital_seal_validator"

export type DigitalSealValidatorActionResult =
  | { status: "found"; signatures: ConsignoSignature[] }
  | { status: "notFound" }
  | { status: "systemFailure" }

export interface ConsignoSignature {
  result?: string
  signerStatus?: {
    certificateInfo?: {
      subjectName?: string
      commonName?: string
    }
  }
  signatureTimestamp?: { date?: string }
  signatureFieldName?: string
  revision?: number
}

export interface DigitalSealValidatorApiBody {
  status?: "found" | "notFound"
  signatures?: ConsignoSignature[]
}

export interface DigitalSealSignerDisplay {
  name: string
  organization: string
  subjectName: string
  signedAt: string
}

const digitalSealDateTimeFormat: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: vancouverTimeZone,
  timeZoneName: "short",
}

const isDigitalSealValidatorApiBody = (body: unknown): body is DigitalSealValidatorApiBody =>
  typeof body === "object" && body !== null

const getDigitalSealValidatorApiBody = (response: unknown): DigitalSealValidatorApiBody | null => {
  let body = response

  if (response && typeof response === "object" && "body" in response) {
    body = (response as { body?: unknown }).body
  }

  return isDigitalSealValidatorApiBody(body) ? body : null
}

export const parseUploadResponseToActionResult = (response: unknown): DigitalSealValidatorActionResult => {
  const body = getDigitalSealValidatorApiBody(response)
  if (body?.status === "notFound") {
    return { status: "notFound" }
  }

  if (body?.status === "found" && Array.isArray(body.signatures)) {
    return { status: "found", signatures: body.signatures }
  }

  return { status: "systemFailure" }
}

export const formatDigitalSealDateTime = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("en-CA", digitalSealDateTimeFormat).format(date)
}

export const parseDigitalSealSignature = (signature: ConsignoSignature): DigitalSealSignerDisplay => {
  const certificateInfo = signature.signerStatus?.certificateInfo
  const subjectName = certificateInfo?.subjectName || ""
  const name = certificateInfo?.commonName || signature.signatureFieldName || ""
  const organization = subjectName
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("OU="))
    .map((part) => part.substring(3))
    .join(", ")
  const dateRaw = signature.signatureTimestamp?.date

  return {
    name,
    organization,
    subjectName,
    signedAt: dateRaw ? formatDigitalSealDateTime(dateRaw) : "",
  }
}
