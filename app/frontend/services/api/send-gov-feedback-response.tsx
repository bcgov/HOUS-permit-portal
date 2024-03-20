import { EGovFeedbackResponseNoReason } from "../../types/enums"

export async function sendGovFeedbackResponse(
  page: string,
  userinput: "Yes" | "No" | "Reason",
  reason?: EGovFeedbackResponseNoReason
) {
  const baseUrl = "https://www2.gov.bc.ca/gov/didyoufind"
}
