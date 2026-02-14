import { Box, Button, Flex, Heading, Icon, Link, List, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { ArrowsClockwise, Download, FileText, Hourglass, Layout } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus, EPreCheckStatus } from "../../../../types/enums"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { PreCheckBackLink } from "../pre-check-back-link"
import { PreCheckReviewDetails } from "../pre-check-review-details"

export const ResultsSummary = observer(function ResultsSummary() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const { preCheckStore } = useMst()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null)
  const [isFetchingPdfUrl, setIsFetchingPdfUrl] = useState(false)

  // Mark as viewed when user views completed results
  useEffect(() => {
    if (currentPreCheck && currentPreCheck.status === EPreCheckStatus.complete && !currentPreCheck.viewedAt) {
      preCheckStore.markPreCheckAsViewed(currentPreCheck.id)
    }
  }, [currentPreCheck, preCheckStore])

  // Fetch PDF report URL when component mounts for completed pre-checks
  useEffect(() => {
    if (currentPreCheck && currentPreCheck.status === EPreCheckStatus.complete && currentPreCheck.externalId) {
      setIsFetchingPdfUrl(true)
      currentPreCheck.fetchPdfReportUrl().then((url) => {
        if (url) {
          setPdfReportUrl(url)
        }
        setIsFetchingPdfUrl(false)
      })
    }
  }, [currentPreCheck])

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
            <List spacing={2} pl={6} mb={6} styleType="decimal">
              <ListItem>{t("preCheck.sections.resultsSummary.step1", "Your drawings are analyzed")}</ListItem>
              <ListItem>
                {t("preCheck.sections.resultsSummary.step2", "A PDF report and interactive results are generated")}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.step3",
                  "The downloadable report and a link to interactive results are available in your Pre-checks"
                )}
              </ListItem>
            </List>

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
          <Box bg="greys.white" p={8} borderRadius="lg" mb={6} border="1px solid" borderColor="greys.grey03">
            <Heading as="h2" size="lg" mb={4}>
              {t("preCheck.sections.resultsSummary.ready", "Your BC Building Code compliance report is ready")}
            </Heading>
            <Heading as="h3" size="md" mb={4}>
              {t("preCheck.sections.resultsSummary.projectDetails", "Project details")}
            </Heading>
            {currentPreCheck && <PreCheckReviewDetails preCheck={currentPreCheck} />}
            <Heading as="h3" size="md" mb={4}>
              {t("preCheck.sections.resultsSummary.sections.whatYouCanDo.title", "What you can do now")}
            </Heading>
            <UnorderedList spacing={2} pl={6} mb={6}>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.whatYouCanDo.download",
                  "Download a PDF report listing all pre-check results, or explore them interactively in alongside your drawings."
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.whatYouCanDo.address",
                  "You can use these results to address any compliance issues and prepare your drawings for a permit application."
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.whatYouCanDo.beta",
                  "This service is in beta. If you experience issues or have questions about your results, contact us at"
                )}
                {"  "}
                <Link
                  href={`mailto:digital.codes.permits@gov.bc.ca?cc=compliance.support@archistar.ai&subject=Pre-check Support - External ID ${currentPreCheck?.externalId} (ID: ${currentPreCheck?.id})`}
                >
                  digital.codes.permits@gov.bc.ca
                </Link>
              </ListItem>
            </UnorderedList>

            <Heading as="h3" size="md" mb={4}>
              {t(
                "preCheck.sections.resultsSummary.sections.reportPreparedBy.title",
                "Report prepared by {{serviceProvider}}",
                {
                  serviceProvider: currentPreCheck?.providerName,
                }
              )}
            </Heading>
            <UnorderedList spacing={2} pl={6} mb={6}>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.reportPreparedBy.providedBy",
                  "This service is provided by {{serviceProvider}} to give you early guidance only.",
                  { serviceProvider: currentPreCheck?.providerName }
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.reportPreparedBy.ministryDisclaimer",
                  "The Ministry of Housing and Municipal Affairs (“we”) does not guarantee the accuracy or completeness of any information produced by this service."
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.reportPreparedBy.liability",
                  "We are not liable for any errors, omissions, or any actions you take in reliance upon this service."
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.reportPreparedBy.notShared",
                  "Results from this service are not shared with your local building officials and are not part of your official permit submission."
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.reportPreparedBy.noGuarantee",
                  "A passing result does not guarantee approval: a building official will still carry out a full review as part of the permit application process."
                )}
              </ListItem>
              <ListItem>
                {t(
                  "preCheck.sections.resultsSummary.sections.reportPreparedBy.jurisdiction",
                  "Only your local jurisdiction can approve or reject a permit application."
                )}
              </ListItem>
            </UnorderedList>
            {!currentPreCheck?.expired && (
              <RouterLinkButton
                leftIcon={<Layout />}
                to={`/pre-checks/${currentPreCheck?.id}/viewer`}
                variant="primary"
                mb={4}
                isDisabled={currentPreCheck?.expired}
              >
                {t("preCheck.sections.resultsSummary.exploreResults", "Explore interactive results")}
              </RouterLinkButton>
            )}
            {!currentPreCheck?.expired && (
              <Flex>
                <Text mb={2}>
                  {t("preCheck.sections.resultsSummary.preferResults", "Prefer results you can save and print?")}
                </Text>

                {isFetchingPdfUrl ? (
                  <Button
                    size="sm"
                    variant="link"
                    leftIcon={<Icon as={Download} />}
                    isLoading
                    isDisabled={currentPreCheck?.expired}
                  >
                    {t("preCheck.sections.resultsSummary.downloadReport", "Download your PDF report")}
                  </Button>
                ) : pdfReportUrl ? (
                  <Button
                    as="a"
                    mb={2}
                    ml={2}
                    href={pdfReportUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    variant="link"
                    leftIcon={<Icon as={Download} />}
                    isDisabled={currentPreCheck?.expired}
                    disabled={currentPreCheck?.expired}
                  >
                    {t("preCheck.sections.resultsSummary.downloadReport", "Download your PDF report")}
                  </Button>
                ) : (
                  <Text fontSize="sm" color="text.secondary">
                    {t("preCheck.sections.resultsSummary.pdfUnavailable", "PDF report unavailable")}
                  </Text>
                )}
              </Flex>
            )}
            {currentPreCheck?.expired && (
              <CustomMessageBox
                title={t("preCheck.sections.resultsSummary.expiredTitle", "This pre-check is expired")}
                description={t(
                  "preCheck.sections.resultsSummary.expiredDescription",
                  "This pre-check is expired because it was created more than 150 days ago."
                )}
                status={EFlashMessageStatus.warning}
              />
            )}
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
      {currentPreCheck?.permitApplicationId && (
        <Flex justify="center" mt={8}>
          <RouterLinkButton
            to={`/permit-applications/${currentPreCheck.permitApplicationId}/edit`}
            variant="secondary"
            leftIcon={<Icon as={FileText} />}
          >
            {t("permitApplication.goToApplication", "Back to permit application")}
          </RouterLinkButton>
        </Flex>
      )}
    </Box>
  )
})
