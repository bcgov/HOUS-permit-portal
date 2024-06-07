import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { getRequirementByKey } from "../../../../utils/formio-component-traversal"

export const useFormEventListeners = (
  triggerSave: () => void,
  setAutofillContactKey: (key: string) => void,
  onContactsOpen: () => void,
  onRevisionsOpen: () => void,
  setRequirementForRevision: (IFormIORequirement) => void,
  permitApplication: IPermitApplication
) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleOpenStepCode = async (_event) => {
    await triggerSave?.()
    navigate("step-code", { state: { background: location } })
  }

  const handleOpenContactAutofill = async (_event) => {
    setAutofillContactKey(_event.detail.key)
    onContactsOpen()
  }

  const handleOpenRequestRevision = async (_event) => {
    const foundRequirement = getRequirementByKey(permitApplication.formJson, _event.detail.key)
    setRequirementForRevision(foundRequirement)
    onRevisionsOpen()
  }

  useEffect(() => {
    document.addEventListener("openStepCode", handleOpenStepCode)
    document.addEventListener("openAutofillContact", handleOpenContactAutofill)
    document.addEventListener("openRequestRevision", handleOpenRequestRevision)
    return () => {
      document.removeEventListener("openStepCode", handleOpenStepCode)
      document.removeEventListener("openAutofillContact", handleOpenContactAutofill)
      document.removeEventListener("openRequestRevision", handleOpenRequestRevision)
    }
  }, [])
}
