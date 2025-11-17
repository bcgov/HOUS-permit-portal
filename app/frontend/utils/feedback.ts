/**
 * Opens the feedback dialog (Jira collector or mailto fallback)
 * This provides a DRY way to handle feedback across the app
 */
export const openFeedbackDialog = () => {
  if (window.showCollectorDialog) {
    window.showCollectorDialog()
  } else {
    window.location.href = "mailto:digital.codes.permits@gov.bc.ca?subject=Building Permit Hub Feedback"
  }
}
