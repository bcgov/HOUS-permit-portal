import { Button, Flex, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFileUploadAttachmentType } from "../../../../../types/enums"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const Report = observer(function Report() {
  const i18nPrefix = "stepCode.part3.report"
  const { checklist } = usePart3StepCode()
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState
  const [isRegenerating, setIsRegenerating] = useState(false)

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

  return (
    <Flex direction="column" gap={6}>
      <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      <Text>{t(`${i18nPrefix}.description`)}</Text>
      <Flex gap={3} align="center">
        {checklist?.freshReportDocument ? (
          <FileDownloadButton
            variant="primary"
            size="md"
            modelType={EFileUploadAttachmentType.ReportDocument}
            document={checklist.freshReportDocument as any}
            simpleLabel
          />
        ) : (
          <SharedSpinner m={0} />
        )}
        <Button variant="secondary" onClick={handleRegenerateReport} isLoading={isRegenerating}>
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
