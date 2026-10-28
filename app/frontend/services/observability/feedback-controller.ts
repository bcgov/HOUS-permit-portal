import type { FeedbackModalIntegration } from "@sentry/core"
import { getCurrentScope, getFeedback, getIsolationScope } from "@sentry/react"
import { applyFeedbackAppearance } from "./feedback-appearance"
import { feedbackArea, FeedbackEntrypoint } from "./privacy"

type FeedbackDialog = ReturnType<FeedbackModalIntegration["createDialog"]>

// Instrumentation state only. Authentication and domain state remain in MST.
export class FeedbackController {
  private active?: { dialog?: FeedbackDialog; restoreFocus: () => void }
  private crashOffered = false
  beforeOpen?: () => Promise<void>

  get enabled() {
    return !!getFeedback()
  }

  async open(entrypoint: FeedbackEntrypoint, eventId?: string): Promise<boolean> {
    const feedback = getFeedback()
    if (!feedback || this.active) return false
    const activeElement = typeof document === "undefined" ? null : (document.activeElement as HTMLElement)
    const opening: NonNullable<FeedbackController["active"]> = {
      restoreFocus: () => {
        if (activeElement?.isConnected) activeElement.focus()
        else if (typeof document !== "undefined")
          document.querySelector<HTMLButtonElement>('[role="alert"] button')?.focus()
      },
    }
    this.active = opening
    const { tags } = getIsolationScope().getScopeData()
    const route = String(tags.route ?? "/[unknown]")
    try {
      if (this.beforeOpen) await this.beforeOpen()
      if (this.active !== opening) return false
      const closeCurrentForm = () => {
        if (this.active === opening) this.close()
      }
      const dialog = await feedback.createForm({
        tags: {
          feedback_entrypoint: entrypoint,
          feedback_area: feedbackArea(route, tags.role),
          feedback_route: route,
          feedback_error_id: eventId ?? "",
        },
        onFormClose: closeCurrentForm,
        onFormSubmitted: closeCurrentForm,
      })
      if (this.active !== opening) {
        dialog.removeFromDom()
        return false
      }
      opening.dialog = dialog
      dialog.appendToDom()
      dialog.open()
      if (typeof HTMLElement !== "undefined" && dialog.el instanceof HTMLElement) applyFeedbackAppearance(dialog.el)
      // The bundled form uses a non-modal <dialog open>. Promote it to a native
      // modal so keyboard focus stays in the form and Escape dismisses it.
      const modal =
        typeof HTMLElement !== "undefined" && dialog.el instanceof HTMLElement
          ? dialog.el.querySelector("dialog")
          : null
      if (modal) {
        modal.close()
        modal.setAttribute("aria-label", modal.querySelector("h2")?.textContent ?? "Feedback")
        modal.addEventListener("cancel", (event) => {
          event.preventDefault()
          this.close()
        })
        modal.showModal()
        modal.querySelector("textarea")?.focus()
      }
      return true
    } catch {
      if (this.active === opening) this.close()
      return false
    }
  }

  crash(eventId: string, userId: string) {
    if (!userId || userId !== getIsolationScope().getUser().id || this.crashOffered || this.active) return
    if (!this.enabled) return
    this.crashOffered = true
    void this.open("crash_prompt", eventId)
  }

  close() {
    const active = this.active
    this.active = undefined
    active?.dialog?.close()
    active?.dialog?.removeFromDom()
    // The SDK's sendFeedback also sets its form tags on the current scope.
    // Dispose of those tags when this form closes; retain user/route metadata.
    if (active)
      getCurrentScope().setTags({
        feedback_entrypoint: undefined,
        feedback_area: undefined,
        feedback_route: undefined,
        feedback_error_id: undefined,
      })
    active?.restoreFocus()
  }
}

export const feedbackController = new FeedbackController()
