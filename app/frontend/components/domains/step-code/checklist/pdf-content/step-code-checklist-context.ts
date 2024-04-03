import { createContext } from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"

interface IContext {
  checklist: IStepCodeChecklist
  permitApplication: IPermitApplication
}
export const StepCodeChecklistContext = createContext<IContext>(null)
