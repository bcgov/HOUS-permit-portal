import { Box, Button, Heading, Icon, Text } from "@chakra-ui/react"
import { ArrowsClockwise, CheckCircle, Hourglass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { EPreCheckStatus } from "../../../../types/enums"
import { PreCheckBackLink } from "../pre-check-back-link"

export const ResultsSummary = observer(function ResultsSummary() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const { preCheckStore } = useMst()
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mark as viewed when user views completed results
  useEffect(() => {
    if (currentPreCheck && currentPreCheck.status === EPreCheckStatus.complete && !currentPreCheck.viewedAt) {
      preCheckStore.markPreCheckAsViewed(currentPreCheck.id)
    }
  }, [currentPreCheck, preCheckStore])

  const handleRefresh = async () => {
    if (!currentPreCheck?.id) return
    setIsRefreshing(true)
    await preCheckStore.fetchPreCheck(currentPreCheck.id)
    setIsRefreshing(false)
  }

  const renderContent = () => {
    switch (currentPreCheck?.status) {
      case EPreCheckStatus.draft:
      case EPreCheckStatus.processing:
        return (
          <Box bg="semantic.infoLight" p={8} borderRadius="lg" mb={6} color="theme.blueAlt">
            <Heading as="h2" size="lg" mb={4} display="flex" alignItems="center" gap={2}>
              <Icon as={Hourglass} boxSize={6} />
              {t("preCheck.sections.resultsSummary.preparing", "We're preparing your results")}
            </Heading>
            <Text mb={6} color="theme.blueAlt">
              {t(
                "preCheck.sections.resultsSummary.timeframe",
                "Most reports are ready within a few hours, but it can take up to 48 hours."
              )}
            </Text>

            <Heading as="h3" size="md" mb={4}>
              {t("preCheck.sections.resultsSummary.whatHappensNext", "What happens next")}
            </Heading>
            <Box as="ol" pl={6} mb={6} sx={{ "& li": { mb: 2 } }}>
              <li>{t("preCheck.sections.resultsSummary.step1", "Your drawings are analyzed")}</li>
              <li>
                {t("preCheck.sections.resultsSummary.step2", "A PDF report and interactive results are generated")}
              </li>
              <li>
                {t(
                  "preCheck.sections.resultsSummary.step3",
                  "The downloadable report and a link to interactive results are available in your Pre-checks"
                )}
              </li>
            </Box>

            <Text mb={4} fontSize="sm" color="theme.blueAlt">
              {t(
                "preCheck.sections.resultsSummary.notification",
                "You don't need to stay on this page. We'll notify you as soon as your results are ready. You'll find completed reports in the Pre-checks section."
              )}
            </Text>

            <Button
              variant="secondary"
              leftIcon={<Icon as={ArrowsClockwise} />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
            >
              {t("preCheck.sections.resultsSummary.refreshStatus", "Refresh status")}
            </Button>
          </Box>
        )

      case EPreCheckStatus.complete:
        return (
          <Box bg="semantic.successLight" p={8} borderRadius="lg" mb={6}>
            <Heading as="h2" size="lg" mb={4} display="flex" alignItems="center" gap={2}>
              <Icon as={CheckCircle} boxSize={6} />
              {t("preCheck.sections.resultsSummary.ready", "Your results are ready")}
            </Heading>
            <Text mb={6} color="theme.blueAlt">
              {t(
                "preCheck.sections.resultsSummary.readyDescription",
                "Your pre-check has been reviewed and the results are now available."
              )}
            </Text>

            <Heading as="h3" size="md" mb={4}>
              {t("preCheck.sections.resultsSummary.nextSteps", "Next steps")}
            </Heading>
            <Box as="ul" pl={6} mb={6} sx={{ "& li": { mb: 2 } }}>
              <li>{t("preCheck.sections.resultsSummary.downloadReport", "Download your PDF report")}</li>
              <li>{t("preCheck.sections.resultsSummary.viewInteractive", "View interactive results")}</li>
              <li>
                {t("preCheck.sections.resultsSummary.proceedToPermit", "Proceed with your building permit application")}
              </li>
            </Box>

            <Button variant="primary" onClick={() => navigate("/pre-checks")}>
              {t("preCheck.form.backToPreChecks", "Go to pre-checks")}
            </Button>
          </Box>
        )

      default:
        return (
          <Box bg="greys.grey03" p={8} borderRadius="lg" mb={6}>
            <Text color="theme.blueAlt">{t("preCheck.sections.resultsSummary.unknownStatus", "Unknown status")}</Text>
          </Box>
        )
    }
  }

  return (
    <Box>
      <PreCheckBackLink />
      {renderContent()}
    </Box>
  )
})
