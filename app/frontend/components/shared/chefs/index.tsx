// The custom components in this directory are from the CHEFS codebase https://github.com/bcgov/common-hosted-form-service/tree/master/components
import { Form, Formio, Templates } from "@formio/react"
import "./styles.scss"

import ChefsFormioComponents from "./additional-formio"
import { overridePanelTemplate } from "./additional-formio/templates/panel"

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
      if (ctx?.component?.computedCompliance) {
        const computedComplianceText =
          ctx?.component?.computedComplianceResult || `This field has compliance capability.`
        template = template.concat(
          `<div class="compliance" data-compliance='${ctx?.component?.computedCompliance?.module}'><i class="ph-fill ph-lightning-a"></i>
          ${computedComplianceText}</div>`
        )
      }
      template = template.concat(defaultLabelTemplate(ctx))
      return template
    },
  },
}

Formio.use(ChefsFormioComponents)

export { Form, Formio }
