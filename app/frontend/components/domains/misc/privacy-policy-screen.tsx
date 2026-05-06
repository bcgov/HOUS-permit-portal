import { Box, Container, Heading, Link, List, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const PrivacyPolicyScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pt="16" pb="36" px="8">
      <Heading as="h1" mb={8}>
        {t("site.privacyPolicy")}
      </Heading>
      <VStack align="flex-start" gap={2} mb={8}>
        <Text fontSize="lg">
          <strong>{t("site.privacyPolicyEffectiveDate")}</strong>
        </Text>
        <Text fontSize="lg">
          <strong>{t("site.privacyPolicyLastUpdated")}</strong>
        </Text>
        <Text fontSize="lg">
          <strong>{t("site.privacyPolicyAppliesTo")}</strong>
        </Text>
      </VStack>
      <VStack align="flex-start" gap={4}>
        <Box>
          <Heading as="h2" size="lg" mb={4} mt={8}>
            {t("site.privacyPolicyOverview")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyOverviewDescription1")}
          </Text>
          <Text fontSize="lg">{t("site.privacyPolicyOverviewDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyWhatInformationWeCollect")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyWhatInformationWeCollectDescription1")}
          </Text>
          <List.Root as="ul" gap={2} pl={6}>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhatInformationWeCollectItem1")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhatInformationWeCollectItem2")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhatInformationWeCollectItem3")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhatInformationWeCollectItem4")}</List.Item>
          </List.Root>
          <Text mt={4} fontSize="lg">
            {t("site.privacyPolicyWhatInformationWeCollectDescription2")}
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyHowWeUseYourInformation")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyHowWeUseYourInformationDescription")}
          </Text>
          <List.Root as="ul" gap={2} pl={6}>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeUseYourInformationItem1")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeUseYourInformationItem2")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeUseYourInformationItem3")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeUseYourInformationItem4")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeUseYourInformationItem5")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeUseYourInformationItem6")}</List.Item>
          </List.Root>
          <Text mt={4} fontSize="lg">
            {t("site.privacyPolicyHowWeUseYourInformationDescription2")}
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyWhoCanAccessYourInformation")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyWhoCanAccessYourInformationDescription")}
          </Text>
          <List.Root as="ul" gap={2} pl={6}>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhoCanAccessYourInformationItem1")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhoCanAccessYourInformationItem2")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhoCanAccessYourInformationItem3")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyWhoCanAccessYourInformationItem4")}</List.Item>
          </List.Root>
          <Text mt={4} fontSize="lg">
            {t("site.privacyPolicyWhoCanAccessYourInformationDescription2")}
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyHowWeProtectYourInformation")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyHowWeProtectYourInformationDescription")}
          </Text>
          <List.Root as="ul" gap={2} pl={6}>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeProtectYourInformationItem1")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeProtectYourInformationItem2")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeProtectYourInformationItem3")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeProtectYourInformationItem4")}</List.Item>
            <List.Item fontSize="lg">{t("site.privacyPolicyHowWeProtectYourInformationItem5")}</List.Item>
          </List.Root>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyThirdPartyServicesAndIntegrations")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyThirdPartyServicesAndIntegrationsDescription1")}
          </Text>
          <Text fontSize="lg">{t("site.privacyPolicyThirdPartyServicesAndIntegrationsDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyChangesToThisPolicy")}
          </Heading>
          <Text fontSize="lg">{t("site.privacyPolicyChangesToThisPolicyDescription")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyContactUs")}
          </Heading>
          <Text mb={4} fontSize="lg">
            {t("site.privacyPolicyContactUsDescription")}
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {t("site.privacyPolicyContactUsTitle")}
          </Text>
          <Text fontSize="lg">{t("site.privacyPolicyContactUsAddress1")}</Text>
          <Text fontSize="lg">{t("site.privacyPolicyContactUsAddress2")}</Text>
          <Text fontSize="lg">
            {t("site.privacyPolicyContactUsEmail")}{" "}
            <Link
              href={`mailto:${t("site.privacyPolicyContactUsEmailAddress")}`}
              style={{ color: "#1a5a96", textDecoration: "underline" }}
            >
              {t("site.privacyPolicyContactUsEmailAddress")}
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}
