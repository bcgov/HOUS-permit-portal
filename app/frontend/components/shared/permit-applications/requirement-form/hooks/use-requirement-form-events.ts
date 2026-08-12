import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../../models/permit-application"
import { EFileUploadAttachmentType, EStepCodeType } from "../../../../../types/enums"
import { downloadFileFromStorage } from "../../../../../utils/utility-functions"

interface IUseRequirementFormEventsParams {
  permitApplication: IPermitApplication
  triggerSave?: (params?: { autosave?: boolean; skipPristineCheck?: boolean }) => Promise<boolean | void> | void
  onContactsOpen: () => void
  onPreviousSubmissionOpen: () => void
}

export function useRequirementFormEvents({
  permitApplication,
  triggerSave,
  onContactsOpen,
  onPreviousSubmissionOpen,
}: IUseRequirementFormEventsParams) {
  const navigate = useNavigate()
  const [autofillContactKey, setAutofillContactKey] = useState(null)
  const [previousSubmissionKey, setPreviousSubmissionKey] = useState(null)
  const [isStepCodeSelectOpen, setIsStepCodeSelectOpen] = useState(false)
  const [stepCodeSelectType, setStepCodeSelectType] = useState<EStepCodeType>(EStepCodeType.part9StepCode)

  const handleSelectExistingStepCode = async (stepCodeId: string) => {
    await triggerSave?.()
    // Assign by updating the StepCode's permitApplicationId (belongs_to association)
    // @ts-ignore method added on model
    const ok = await permitApplication.assignExistingStepCode(stepCodeId)
    if (ok) setIsStepCodeSelectOpen(false)
  }

  useEffect(() => {
    const handleOpenStepCodePart3 = async (_event) => {
      await triggerSave?.()
      navigate("part-3-step-code")
    }

    const handleOpenStepCodePart9 = async (_event) => {
      await triggerSave?.()
      navigate("part-9-step-code")
    }

    const handleOpenContactAutofill = async (event) => {
      setAutofillContactKey(event.detail.key)
      onContactsOpen()
    }

    const handleOpenPreviousSubmission = async (event) => {
      setPreviousSubmissionKey(event.detail.key)
      onPreviousSubmissionOpen()
    }

    const handleOpenExistingStepCode = async (event) => {
      const incoming = event?.detail?.stepCodeType as EStepCodeType
      setStepCodeSelectType(
        incoming === EStepCodeType.part3StepCode ? EStepCodeType.part3StepCode : EStepCodeType.part9StepCode
      )
      setIsStepCodeSelectOpen(true)
    }

    const handleDownloadRequirementDocument = async (event) => {
      downloadFileFromStorage({
        model: EFileUploadAttachmentType.RequirementDocument,
        modelId: event.detail.id,
        filename: event.detail.filename,
      })
    }

    const handleOpenResourceLink = (event) => {
      window.open(event.detail.url, "_blank", "noopener,noreferrer")
    }

    const handleDownloadResourceDocument = async (event) => {
      downloadFileFromStorage({
        model: EFileUploadAttachmentType.ResourceDocument,
        modelId: event.detail.id,
        filename: event.detail.filename,
      })
    }

    document.addEventListener("openStepCode", handleOpenStepCodePart9)
    document.addEventListener("openStepCodePart3", handleOpenStepCodePart3)
    document.addEventListener("openAutofillContact", handleOpenContactAutofill)
    document.addEventListener("openPreviousSubmission", handleOpenPreviousSubmission)
    document.addEventListener("openExistingStepCode", handleOpenExistingStepCode)
    document.addEventListener("downloadRequirementDocument", handleDownloadRequirementDocument)
    document.addEventListener("openResourceLink", handleOpenResourceLink)
    document.addEventListener("downloadResourceDocument", handleDownloadResourceDocument)

    return () => {
      document.removeEventListener("openStepCode", handleOpenStepCodePart9)
      document.removeEventListener("openStepCodePart3", handleOpenStepCodePart3)
      document.removeEventListener("openAutofillContact", handleOpenContactAutofill)
      document.removeEventListener("openPreviousSubmission", handleOpenPreviousSubmission)
      document.removeEventListener("openExistingStepCode", handleOpenExistingStepCode)
      document.removeEventListener("downloadRequirementDocument", handleDownloadRequirementDocument)
      document.removeEventListener("openResourceLink", handleOpenResourceLink)
      document.removeEventListener("downloadResourceDocument", handleDownloadResourceDocument)
    }
  }, [])

  return {
    autofillContactKey,
    previousSubmissionKey,
    isStepCodeSelectOpen,
    setIsStepCodeSelectOpen,
    stepCodeSelectType,
    handleSelectExistingStepCode,
  }
}
