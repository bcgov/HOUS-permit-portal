// The custom components in this directory are from the CHEFS codebase https://github.com/bcgov/common-hosted-form-service/tree/master/components
import { Form, Formio, Templates } from "@formio/react"
import "./styles.scss"

import { t } from "i18next"
import ChefsFormioComponents from "./additional-formio"
import { overridePanelTemplate } from "./additional-formio/templates/panel"

import { FILE_UPLOAD_MAX_SIZE } from "./additional-formio/constant"

const defaultLabelTemplate = Templates.current.label.form
const defaultButtonsTemplate = Templates.current.button.form
const chefsTemplateGlobal = globalThis as typeof globalThis & {
  __housOriginalLabelTemplate?: typeof defaultLabelTemplate
  __housOriginalButtonsTemplate?: typeof defaultButtonsTemplate
}
const originalLabelTemplate = chefsTemplateGlobal.__housOriginalLabelTemplate ?? defaultLabelTemplate
const originalButtonsTemplate = chefsTemplateGlobal.__housOriginalButtonsTemplate ?? defaultButtonsTemplate
chefsTemplateGlobal.__housOriginalLabelTemplate = originalLabelTemplate
chefsTemplateGlobal.__housOriginalButtonsTemplate = originalButtonsTemplate

//container - we can add for main headers like Contact Info.
//panels - are for section blocks, to put things inside panels, we need to target the components section under the body

Templates.current = {
  panel: {
    form: (ctx) => {
      let template = overridePanelTemplate(ctx)
      return template
    },
  },
  button: {
    form: (ctx) => {
      let template = ""
      if (ctx?.component?.energyStepCodeWarning) {
        template = template.concat(
          `<div class="energy-step-code-warning"><i class="ph-fill ph-info"></i>${ctx?.component?.energyStepCodeWarning}</div>`
        )
      }

      template = template.concat(originalButtonsTemplate(ctx))
      return template
    },
  },
  label: {
    form: (ctx) => {
      let template = ""
      if (ctx?.component?.instructions) {
        template = `<div class="form-group-instructions">${ctx.component.instructions}</div>`
      }
      const baseLabelTemplate = originalLabelTemplate(ctx)
      template = template.concat(baseLabelTemplate)
      if (ctx?.component?.computedCompliance) {
        let result = ctx?.component?.computedComplianceResult
        let computedComplianceHtml = ""
        let showWarning = false

        if (result) {
          if (ctx?.component?.computedCompliance?.module == "DigitalSealValidator") {
            // For multi-file uploads, show validation for each file.
            // Normalize ids: compliance messages use full shrine paths, form values often use basename only.
            const fileIdTail = (id) => (typeof id === "string" ? id.split("/").pop() : id)
            const currentFiles = Array.isArray(ctx.value) ? ctx.value : []
            // During websocket triggerRedraw, ctx.value can briefly be empty while result is already set —
            // fall back to the compliance result (already scoped to active docs server-side).
            const currentFileMessages =
              currentFiles.length === 0
                ? result
                : result.filter((fileMessage) =>
                    currentFiles.find((v) => fileIdTail(fileMessage.id) == fileIdTail(v.id))
                  )

            if (currentFileMessages.length > 0) {
              showWarning = currentFileMessages.some((fileMessage) => fileMessage.error || !fileMessage.signers?.length)

              const contactEmail = t("site.contactEmail")
              const systemFailureBody = t("projectReadinessTools.digitalSealValidator.systemFailureMessage", {
                email: contactEmail,
              })
                .replace("<1>", `<a href="mailto:${contactEmail}">`)
                .replace("</1>", "</a>")
              const signedAtLabel = t("projectReadinessTools.digitalSealValidator.signedAt")

              // Keep existing tooltip layout; only align copy with the standalone tool.
              const fileItems = currentFileMessages
                .map((fileMessage) => {
                  const hasError = fileMessage.error
                  const fileName = fileMessage.filename || "File"
                  const hasSigners = fileMessage.signers && fileMessage.signers.length > 0

                  if (hasError) {
                    return `
                      <div class="compliance-file-item compliance-file-error">
                        <div class="compliance-file-name">• ${fileName} — ${t("projectReadinessTools.digitalSealValidator.systemFailureTitle")}</div>
                        <div class="compliance-file-error-message">${systemFailureBody}</div>
                      </div>
                    `
                  } else if (hasSigners) {
                    const signersHtml = fileMessage.signers
                      .map(
                        (signer) => `
                        <div class="compliance-signer">
                          <div class="compliance-signer-name">✓ ${signer.name}${signer.organization ? ` (${signer.organization})` : ""}</div>
                          <div class="compliance-signer-date">${signedAtLabel} ${signer.date}</div>
                        </div>
                      `
                      )
                      .join("")

                    return `
                      <div class="compliance-file-item">
                        <div class="compliance-file-name">• ${fileName} — ${t("projectReadinessTools.digitalSealValidator.foundTitle")}</div>
                        ${signersHtml}
                      </div>
                    `
                  } else {
                    return `
                      <div class="compliance-file-item">
                        <div class="compliance-file-name">• ${fileName} — ${t("projectReadinessTools.digitalSealValidator.notFoundTitle")}</div>
                        <div class="compliance-file-message">${t("projectReadinessTools.digitalSealValidator.noSignaturesFound")}</div>
                      </div>
                    `
                  }
                })
                .join("")

              computedComplianceHtml = `
                <div class="compliance-digital-signatures">
                  <div class="compliance-section-title"><i class="ph-fill ph-lightning-a"></i>${
                    showWarning
                      ? t("projectReadinessTools.digitalSealValidator.notFoundTitle")
                      : t("projectReadinessTools.digitalSealValidator.foundTitle")
                  }</div>
                  ${fileItems}
                </div>
              `
            } else {
              computedComplianceHtml = t(`automatedCompliance.baseMessage`)
            }
          } else {
            // Other compliance modules - default value display
            computedComplianceHtml = t("automatedCompliance.defaultValueMessage", { defaultValue: result })
          }
        } else if ("computedComplianceResult" in ctx.component) {
          showWarning = true
          computedComplianceHtml = t("automatedCompliance.failedValueMessage")
        } else {
          computedComplianceHtml = t(`automatedCompliance.baseMessage`)
        }

        template = template.concat(
          `<div key={'${ctx?.id}-compliance'} class="compliance ${showWarning ? "compliance-warning" : ""}" data-compliance='${ctx?.component?.computedCompliance?.module}'>
            <span>${computedComplianceHtml}</span>
          </div>`
        )
      }
      return template
    },
  },
}

Formio.use(ChefsFormioComponents)

const defaultOptions = {
  componentOptions: {
    simplefile: {
      config: {
        uploads: {
          fileMaxSize: `${FILE_UPLOAD_MAX_SIZE}MB`,
        },
      },
    },
  },
}

export { defaultOptions, Form, Formio }
