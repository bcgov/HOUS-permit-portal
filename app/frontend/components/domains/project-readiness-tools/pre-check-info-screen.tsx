import { Box, Container, Heading, Link, List, Text } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const PreCheckInfoScreen = () => {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const [enrolledJurisdictions, setEnrolledJurisdictions] = useState<string[]>([])

  useEffect(() => {
    // Fetch jurisdiction enrollments for Archistar
    const fetchJurisdictionEnrollments = async () => {
      try {
        const response = await siteConfigurationStore.fetchJurisdictionEnrollments("archistar")
        if (response?.ok && response.data) {
          const jurisdictions = response.data.data.map((enrollment: any) => enrollment.jurisdictionQualifiedName)
          setEnrolledJurisdictions(jurisdictions)
        }
      } catch (error) {
        console.error("Failed to fetch jurisdiction enrollments:", error)
      }
    }

    fetchJurisdictionEnrollments()
  }, [siteConfigurationStore])

  const renderCommunitiesList = () => {
    if (siteConfigurationStore.anyProviderEnabledForAllJurisdictions) {
      return (
        <List.Root as="ul" gap={2} pl={6}>
          <List.Item color="theme.blueAlt">{t("preCheck.infoPage.allJurisdictions", "All jurisdictions")}</List.Item>
        </List.Root>
      )
    }

    if (enrolledJurisdictions.length === 0) {
      return (
        <List.Root as="ul" gap={2} pl={6}>
          <List.Item>{t("preCheck.infoPage.noJurisdictions", "No jurisdictions enrolled")}</List.Item>
        </List.Root>
      )
    }

    return (
      <List.Root as="ul" gap={2} pl={6}>
        {enrolledJurisdictions.map((jurisdiction, index) => (
          <List.Item key={index}>{jurisdiction}</List.Item>
        ))}
      </List.Root>
    )
  }

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16">
        {t("preCheck.infoPage.title", "Pre-check your drawings for compliance with BC Building Code")}
      </Heading>
      <Text pt="4" fontSize="lg">
        {t(
          "preCheck.infoPage.description",
          "You can use this service to pre-check your drawings for compliance with select areas of the BC Building Code before you submit a permit application. During beta, the service is available only in participating communities. You may also be invited to share feedback about your experience."
        )}
      </Text>
      <Box bg="background.blueLight" p={6} borderRadius="lg" mt={8} color="theme.blueAlt">
        <Heading as="h2" size="md" mb={4} color="theme.blueAlt">
          {t("preCheck.infoPage.whereYouCanUse", "Where you can use this service")}
        </Heading>
        <Text mb={4} color="theme.blueAlt">
          {t(
            "preCheck.infoPage.whereDescription",
            "This service is in beta, so availability is limited. You can only use the service if your project is in one of these communities:"
          )}
        </Text>
        {renderCommunitiesList()}

        <Heading as="h2" size="md" mb={4} color="theme.blueAlt" mt={6}>
          {t("preCheck.infoPage.projectsYouCanUse", "Projects you can use this service for")}
        </Heading>
        <Text mb={4} color="theme.blueAlt">
          {t(
            "preCheck.infoPage.projectsDescription",
            "This service is only for small residential projects Part 9 of the BC Building Code, including:"
          )}
        </Text>
        <List.Root as="ul" gap={2} pl={6}>
          <List.Item>{t("preCheck.infoPage.projectType1", "single detached houses")}</List.Item>
          <List.Item>{t("preCheck.infoPage.projectType2", "townhouses")}</List.Item>
          <List.Item>{t("preCheck.infoPage.projectType3", "duplexes, triplexes, or fourplexes")}</List.Item>
          <List.Item>
            {t("preCheck.infoPage.projectType4", "laneway houses, carriage houses, or garden suites")}
          </List.Item>
        </List.Root>
        <Text>
          {t(
            "preCheck.infoPage.conclusion",
            "If your project is in one of these communities and meets these criteria, you can use this service to pre-check your drawings."
          )}
        </Text>

        <RouterLinkButton to="/pre-checks/new" variant="primary" mt={6}>
          {t("preCheck.infoPage.startNow", "Start now")}
        </RouterLinkButton>
      </Box>
      <Box maxW="container.md">
        <Heading as="h2" size="lg" mt={12} mb={6}>
          {t("preCheck.infoPage.howItWorks", "How it works")}
        </Heading>
        <List.Root gap={3} pl={6} listStyleType="decimal" mb={8}>
          <List.Item>{t("preCheck.infoPage.step1", "Upload your drawings")}</List.Item>
          <List.Item>
            {t(
              "preCheck.infoPage.step2",
              "Receive a detailed report showing where your drawings do or don't follow the BC Building Code"
            )}
          </List.Item>
          <List.Item>{t("preCheck.infoPage.step3", "Update your drawings to fix issues")}</List.Item>
          <List.Item>{t("preCheck.infoPage.step4", "Apply for your permit(s) with your updated drawings")}</List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mb={6}>
          {t("preCheck.infoPage.aboutResults", "About your results and permit approval")}
        </Heading>
        <Text mb={4}>
          {t(
            "preCheck.infoPage.aboutResultsDescription",
            "This service gives you information only. Results depend on the accuracy of the drawings you upload."
          )}
        </Text>
        <List.Root as="ul" gap={3} pl={6} mb={8}>
          <List.Item>
            {t(
              "preCheck.infoPage.disclaimer1",
              "Results are for your reference only; results will not be included as part of a permit application for your project"
            )}
          </List.Item>
          <List.Item>
            {t("preCheck.infoPage.disclaimer2", "Results do not replace a plan check by a building official")}
          </List.Item>
          <List.Item>
            {t(
              "preCheck.infoPage.disclaimer3",
              "A passing result does not mean your drawings are approved or that a permit will be issued"
            )}
          </List.Item>
          <List.Item>
            {t(
              "preCheck.infoPage.disclaimer4",
              "Permits are approved or rejected by the authority having jurisdiction for your project"
            )}
          </List.Item>
          <List.Item>
            {t("preCheck.infoPage.disclaimer5", "While this service is in beta, you may encounter occasional issues")}
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mb={6}>
          {t("preCheck.infoPage.betaBenefits", "Benefits of taking part in this service during beta")}
        </Heading>
        <Text mb={4}>{t("preCheck.infoPage.betaBenefitsIntro", "By using this service during beta, you may:")}</Text>
        <List.Root as="ul" gap={3} pl={6} mb={8}>
          <List.Item>
            {t("preCheck.infoPage.benefit1", "Pre-check your drawings for common compliance issues before you apply")}
          </List.Item>
          <List.Item>{t("preCheck.infoPage.benefit2", "Get feedback within two days or less")}</List.Item>
          <List.Item>{t("preCheck.infoPage.benefit3", "Spot issues early, before they cause delays")}</List.Item>
          <List.Item>
            {t("preCheck.infoPage.benefit4", "Better understand building code requirements for your project")}
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mb={6}>
          {t(
            "preCheck.infoPage.thirdPartyPartnership",
            "This service is provided in partnership with third-party companies"
          )}
        </Heading>
        <Text mb={8}>
          {t(
            "preCheck.infoPage.thirdPartyDescription",
            "The Ministry of Housing and Municipal Affairs works with technology companies to deliver this service. Service partners build tools for property development, design, and automated compliance checking."
          )}
        </Text>

        <Heading as="h2" size="lg" mb={6}>
          {t("preCheck.infoPage.feedback", "Your feedback helps us improve this service")}
        </Heading>
        <Text mb={4}>
          {t(
            "preCheck.infoPage.feedbackDescription1",
            "While using this service, you can choose to be contacted by the Ministry of Housing and Municipal Affairs to take part in research like surveys or interviews."
          )}
        </Text>
        <Text mb={8}>
          {t(
            "preCheck.infoPage.feedbackDescription2",
            "You can also ask questions, share feedback, or enquire about research opportunities anytime by emailing us at"
          )}{" "}
          <Link href="mailto:digital.codes.permits@gov.bc.ca" color="text.link">
            digital.codes.permits@gov.bc.ca
          </Link>
        </Text>
      </Box>
    </Container>
  )
}
