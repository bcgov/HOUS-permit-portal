import { Box, Button, Heading, Icon, List, ListIcon, ListItem, Text, VStack } from "@chakra-ui/react"
import { CheckCircle, DownloadSimple, WarningCircle } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { EFlashMessageStatus } from "../../../../types/enums"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"

interface ISectionStatus {
  labelKey: string
  complete: boolean
}

export const Summary = observer(function Summary() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const [isDownloading, setIsDownloading] = useState(false)

  if (!currentOverheatingCode) return null

  const sections: ISectionStatus[] = [
    { labelKey: "introduction", complete: currentOverheatingCode.isIntroductionComplete },
    { labelKey: "buildingLocation", complete: currentOverheatingCode.isBuildingLocationComplete },
    { labelKey: "coolingZoneCompliance", complete: currentOverheatingCode.isCoolingZoneComplianceComplete },
    { labelKey: "designConditions", complete: currentOverheatingCode.isDesignConditionsComplete },
    { labelKey: "buildingComponents", complete: currentOverheatingCode.isBuildingComponentsComplete },
    { labelKey: "attachedDocuments", complete: currentOverheatingCode.isAttachedDocumentsComplete },
    { labelKey: "calculationsPerformedBy", complete: currentOverheatingCode.isCalculationsPerformedByComplete },
  ]

  const allComplete = sections.every((s) => s.complete)
  const completedCount = sections.filter((s) => s.complete).length

  const handleDownloadPdf = async () => {
    setIsDownloading(true)
    try {
      await currentOverheatingCode.downloadPdf()
    } catch (error) {
      console.error("PDF download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.summary.title")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t("overheatingCode.sections.summary.description")}
      </Text>

      <VStack align="stretch" spacing={6}>
        {/* Section completion checklist */}
        <Box bg="gray.50" borderRadius="md" p={5}>
          <Heading as="h3" size="sm" mb={3}>
            {t("overheatingCode.sections.summary.completionStatus" as const as any, {
              completed: completedCount,
              total: sections.length,
            })}
          </Heading>
          <List spacing={2}>
            {sections.map((section) => (
              <ListItem key={section.labelKey} display="flex" alignItems="center">
                <ListIcon
                  as={section.complete ? CheckCircle : WarningCircle}
                  color={section.complete ? "green.500" : "yellow.600"}
                  weight="regular"
                  boxSize={5}
                />
                <Text fontSize="sm">{t(`overheatingCode.sidebar.${section.labelKey}` as const as any)}</Text>
              </ListItem>
            ))}
          </List>
        </Box>

        {!allComplete && (
          <CustomMessageBox
            status={EFlashMessageStatus.warning}
            description={t("overheatingCode.sections.summary.incompleteWarning" as const as any)}
          />
        )}

        {/* Download button */}
        <Box>
          <Button
            size="lg"
            variant="primary"
            leftIcon={<Icon as={DownloadSimple} weight="bold" />}
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            loadingText={t("overheatingCode.sections.summary.generating" as const as any)}
          >
            {t("overheatingCode.sections.summary.downloadReport" as const as any)}
          </Button>
          <Text fontSize="xs" color="text.secondary" mt={2}>
            {t("overheatingCode.sections.summary.downloadHint" as const as any)}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
})
