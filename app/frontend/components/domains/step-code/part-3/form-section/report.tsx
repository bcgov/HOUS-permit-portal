import { Button, Flex, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { ReportDocumentActions } from "../../report-document-actions"
import { usePart3Navigation } from "../use-part-3-navigation"
import { SectionHeading } from "./shared/section-heading"

export const Report = observer(function Report() {
  const i18nPrefix = "stepCode.part3.report"
  const { checklist, currentStepCode } = usePart3StepCode()
  const { exitLinkPath } = usePart3Navigation()
  const navigate = useNavigate()
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState
  const [isRegenerating, setIsRegenerating] = useState(false)
  const freshReport = checklist?.freshReportDocument ?? null
  const awaitingReport = !!checklist?.reportGenerationPending && !freshReport

  useEffect(() => {
    if (!freshReport) return
    setIsRegenerating(false)
    checklist?.clearReportGenerationPending()
  }, [freshReport, checklist])

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

  return (
    <Flex direction="column" gap={6}>
      <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      <Text>{t(`${i18nPrefix}.description`)}</Text>
      <VStack align="start" spacing={3}>
        <Flex gap={3} align="center" wrap="wrap">
          <ReportDocumentActions
            freshReport={freshReport}
            awaitingReport={awaitingReport}
            canEmail={!!currentStepCode?.jurisdiction}
            onShare={async (reportId) => {
              await currentStepCode?.shareReportWithJurisdiction(reportId)
            }}
          />
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
