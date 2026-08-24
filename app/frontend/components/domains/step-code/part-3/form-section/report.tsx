import { Button, Flex, Text } from "@chakra-ui/react"
import { ShareNetwork } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFileUploadAttachmentType } from "../../../../../types/enums"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../../../shared/confirmation-modal"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const Report = observer(function Report() {
  const i18nPrefix = "stepCode.part3.report"
  const { checklist, currentStepCode } = usePart3StepCode()
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const freshReport = checklist?.freshReportDocument
  const canShare = !!freshReport && !!currentStepCode?.jurisdiction

  const onSubmit = async () => {
    if (!checklist) return

    const updateSucceeded = await checklist.completeSection("report")
    if (!updateSucceeded) throw new Error("Failed to complete report section")
  }

  const handleRegenerateReport = async () => {
    if (!checklist) return

    setIsRegenerating(true)
    try {
      const updateSucceeded = await checklist.regenerateReport()
      if (!updateSucceeded) throw new Error("Failed to regenerate report")
    } finally {
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
      <Text>{t(`${i18nPrefix}.description`)}</Text>
      <Flex gap={3} align="center">
        {freshReport ? (
          <FileDownloadButton
            variant="primary"
            size="md"
            modelType={EFileUploadAttachmentType.ReportDocument}
            document={freshReport as any}
            simpleLabel
          />
        ) : (
          isRegenerating && <SharedSpinner m={0} />
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
                variant="primary"
                size="md"
                leftIcon={<ShareNetwork size={16} />}
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
        <Button type="button" variant="secondary" onClick={handleRegenerateReport} isLoading={isRegenerating}>
          {t("stepCode.regenerateReport")}
        </Button>
      </Flex>
      <Part3FormFooter
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        isDisabled={!checklist?.canMarkComplete}
      />
    </Flex>
  )
})
