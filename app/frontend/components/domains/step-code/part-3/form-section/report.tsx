import { Button, Flex, Text, VStack } from "@chakra-ui/react"
import { PaperPlaneRight } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFileUploadAttachmentType } from "../../../../../types/enums"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { ConfirmationModal } from "../../../../shared/confirmation-modal"
import { usePart3Navigation } from "../../use-part-3-navigation"
import { SectionHeading } from "./shared/section-heading"

export const Report = observer(function Report() {
  const i18nPrefix = "stepCode.part3.report"
  const { checklist, currentStepCode } = usePart3StepCode()
  const { exitLinkPath } = usePart3Navigation()
  const navigate = useNavigate()
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const freshReport = checklist?.freshReportDocument
  const canShare = !!freshReport && !!currentStepCode?.jurisdiction

  useEffect(() => {
    if (freshReport) setIsRegenerating(false)
  }, [freshReport])

  const onSubmit = async () => {
    if (!checklist) return

    const updateSucceeded = await checklist.completeSection("report")
    if (!updateSucceeded) throw new Error("Failed to complete report section")
  }

  const handleSaveAndExit = handleSubmit(async () => {
    await onSubmit()
    navigate(exitLinkPath)
  })

  const handleRegenerateReport = async () => {
    if (!checklist) return

    setIsRegenerating(true)
    try {
      const updateSucceeded = await checklist.regenerateReport()
      if (!updateSucceeded) setIsRegenerating(false)
    } catch {
      setIsRegenerating(false)
    }
  }

  const handleShare = async () => {
    const reportId = checklist?.freshReportDocument?.id
    if (!reportId) return
    setIsSharing(true)
    try {
      await currentStepCode?.shareReportWithJurisdiction(reportId)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Flex direction="column" gap={6}>
      <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      {!freshReport && <Text>{t(`${i18nPrefix}.description`)}</Text>}
      <VStack align="start" spacing={3}>
        <Flex gap={3} align="center" wrap="wrap">
          {freshReport && (
            <FileDownloadButton
              variant="secondary"
              size="md"
              modelType={EFileUploadAttachmentType.ReportDocument}
              document={freshReport as any}
              simpleLabel
            />
          )}
          {canShare && (
            <ConfirmationModal
              title={t("stepCode.shareReport.confirmTitle")}
              body={t("stepCode.shareReport.confirmBody")}
              onConfirm={async (closeModal) => {
                await handleShare()
                closeModal()
              }}
              renderTriggerButton={(props) => (
                <Button
                  {...props}
                  type="button"
                  variant="secondary"
                  size="md"
                  leftIcon={<PaperPlaneRight size={16} />}
                  isLoading={isSharing}
                >
                  {t("stepCode.shareReport.action")}
                </Button>
              )}
              renderConfirmationButton={(props) => (
                <Button {...props} variant="primary" isLoading={isSharing}>
                  {t("stepCode.shareReport.confirm")}
                </Button>
              )}
            />
          )}
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAndExit}
            isLoading={isSubmitting}
            isDisabled={!checklist?.canMarkComplete}
          >
            {t("stepCode.saveAndExit")}
          </Button>
        </Flex>
        <Button type="button" variant="link" onClick={handleRegenerateReport} isLoading={isRegenerating}>
          {t("stepCode.regenerateReport")}
        </Button>
      </VStack>
    </Flex>
  )
})
