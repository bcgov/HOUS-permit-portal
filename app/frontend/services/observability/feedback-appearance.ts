import type { FeedbackInternalOptions } from "@sentry/core"
import i18n from "i18next"
import { brand } from "../../styles/brand"

const accents = {
  accentBackground: brand.blue,
  accentForeground: "#ffffff",
  outline: `2px solid ${brand.blue}`,
}

export function feedbackOptions(): Partial<FeedbackInternalOptions> {
  return {
    themeLight: accents,
    themeDark: { ...accents, outline: `2px solid ${brand.yellow}` },
    autoInject: false,
    showName: false,
    showEmail: false,
    enableScreenshot: false,
    useSentryUser: { name: "", email: "" },
    formTitle: i18n.t("sentry.feedbackTitle"),
    messageLabel: i18n.t("sentry.descriptionLabel"),
    submitButtonLabel: i18n.t("sentry.send"),
    cancelButtonLabel: i18n.t("sentry.cancel"),
  }
}

export function applyFeedbackAppearance(container: HTMLElement) {
  container.style.fontFamily = `"${brand.fontFamily}", sans-serif`
  container.style.setProperty("--font-family", `"${brand.fontFamily}", sans-serif`)
  container.style.setProperty("--form-width", "100%")
  container.style.setProperty("--dialog-border-radius", "8px")
  // The bundled widget lives in a shadow root. Keep these layout overrides
  // with this form so desktop width includes padding and mobile text can wrap.
  const style = document.createElement("style")
  style.textContent = `
    /* Native modal dialogs have browser size limits that leave uncovered strips. */
    .dialog {
      box-sizing: border-box;
      width: 100%;
      height: 100dvh;
      max-width: none;
      max-height: none;
    }
    .dialog__position {
      box-sizing: border-box;
      inset: 50% auto auto 50%;
      transform: translate(-50%, -50%);
      width: min(400px, calc(100vw - 32px));
      max-width: calc(100vw - 32px);
      max-height: calc(100dvh - 32px);
      padding: 0;
    }
    .dialog__content {
      box-sizing: border-box;
      min-width: 0;
      max-height: calc(100dvh - 32px);
    }
    .form, .form__right, .dialog__title { min-width: 0; }
    .form__right { flex: 1 1 auto; }
    .form__label__text { flex-wrap: wrap; }
  `
  container.appendChild(style)
}
