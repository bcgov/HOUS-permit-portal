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
      let template = defaultLabelTemplate(ctx)
      if (ctx?.component?.computedCompliance) {
        let result = ctx?.component?.computedComplianceResult

        let computedComplianceText
        let showWarning = false
        if (result) {
          if (ctx?.component?.computedCompliance?.module == "DigitalSealValidator") {
            //assume an array of one response or an array of responses for multiple files
            //utilize id in the compliance messge to check if the front end id matches the file
            const currentFileMessages = result.filter((fileMessage) => ctx.value.find((v) => v.id == fileMessage.id))
            const parsedMessage = currentFileMessages.map((fileMessage) => fileMessage.message).join(",")
            showWarning = currentFileMessages.some((fileMessage) => fileMessage.error)
            computedComplianceText = parsedMessage || t(`automatedCompliance.baseMessage`)
          } else {
            //assume all complianes are default values except for seal validators
            computedComplianceText = t("automatedCompliance.defaultValueMessage", { defaultValue: result })
          }
        } else if ("computedComplianceResult" in ctx.component) {
          showWarning = true
          computedComplianceText = t("automatedCompliance.failedValueMessage")
        } else {
          computedComplianceText = t(`automatedCompliance.baseMessage`)
        }

        template = template.concat(
          `<div key={'${ctx?.id}-compliance'} class="compliance ${showWarning ? "compliance-warning" : ""}" data-compliance='${ctx?.component?.computedCompliance?.module}'><span><i class="ph-fill ph-lightning-a"></i>
          ${computedComplianceText}</span></div>`
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

export { Form, Formio, defaultOptions }
