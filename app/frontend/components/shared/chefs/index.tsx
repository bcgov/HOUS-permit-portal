// The custom components in this directory are from the CHEFS codebase https://github.com/bcgov/common-hosted-form-service/tree/master/components
import { Form, Formio, Templates } from "@formio/react"
import "./styles.scss"

import { t } from "i18next"
import ChefsFormioComponents from "./additional-formio"
import { overridePanelTemplate } from "./additional-formio/templates/panel"

import { FILE_UPLOAD_MAX_SIZE } from "./additional-formio/constant"

const defaultLabelTemplate = Templates.current.label.form
const defaultButtonsTemplate = Templates.current.button.form

//container - we can add for main headers like Contact Info
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

      template = template.concat(defaultButtonsTemplate(ctx))
      return template
    },
  },
  label: {
    form: (ctx) => {
      let template = ""
      if (ctx?.component?.instructions) {
        template = `<div class="form-group-instructions">${ctx.component.instructions}</div>`
      }
      template = template.concat(defaultLabelTemplate(ctx))
      if (ctx?.component?.computedCompliance) {
        let result = ctx?.component?.computedComplianceResult
        let computedComplianceHtml = ""
        let showWarning = false

        if (result) {
          if (ctx?.component?.computedCompliance?.module == "DigitalSealValidator") {
            // For multi-file uploads, show validation for each file
            const currentFileMessages = result.filter((fileMessage) =>
              ctx.value?.find((v) => {
                const idSegments = fileMessage.id.split("/")
                const fileMessageId = idSegments[idSegments.length - 1]
                return fileMessageId == v.id
              })
            )

            if (currentFileMessages.length > 0) {
              showWarning = currentFileMessages.some((fileMessage) => fileMessage.error)

              // Build enhanced list format
              const fileItems = currentFileMessages
                .map((fileMessage) => {
                  const hasError = fileMessage.error
                  const fileName = fileMessage.filename || "File"

                  if (hasError) {
                    return `
                      <div class="compliance-file-item compliance-file-error">
                        <div class="compliance-file-name">• ${fileName}</div>
                        <div class="compliance-file-error-message">${fileMessage.message}</div>
                      </div>
                    `
                  } else if (fileMessage.signers && fileMessage.signers.length > 0) {
                    const signersHtml = fileMessage.signers
                      .map(
                        (signer) => `
                        <div class="compliance-signer">
                          <div class="compliance-signer-name">✓ ${signer.name}${signer.organization ? ` (${signer.organization})` : ""}</div>
                          <div class="compliance-signer-date">Signed: ${signer.date}</div>
                        </div>
                      `
                      )
                      .join("")

                    return `
                      <div class="compliance-file-item">
                        <div class="compliance-file-name">• ${fileName}</div>
                        ${signersHtml}
                      </div>
                    `
                  } else {
                    return `
                      <div class="compliance-file-item">
                        <div class="compliance-file-name">• ${fileName}</div>
                        <div class="compliance-file-message">${t("projectReadinessTools.digitalSealValidator.noSignaturesFound")}</div>
                      </div>
                    `
                  }
                })
                .join("")

              computedComplianceHtml = `
                <div class="compliance-digital-signatures">
                  <div class="compliance-section-title"><i class="ph-fill ph-lightning-a"></i>${t("projectReadinessTools.digitalSealValidator.digitalSignaturesDetected")}:</div>
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
