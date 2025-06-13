import { Box, Container, Heading, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const PrivacyPolicyScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pt="16" pb="36" px="8">
      <Heading as="h1" mb={8}>
        {t("site.privacyPolicy")}
      </Heading>

      <VStack align="flex-start" spacing={2} mb={8}>
        <Text>{t("site.privacyPolicyEffectiveDate")}</Text>
        <Text>{t("site.privacyPolicyLastUpdated")}</Text>
        <Text>{t("site.privacyPolicyAppliesTo")}</Text>
      </VStack>

      <VStack align="flex-start" spacing={4}>
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            {t("site.privacyPolicyOverview")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyOverviewDescription1")}</Text>
          <Text>{t("site.privacyPolicyOverviewDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyWhatInformationWeCollect")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyWhatInformationWeCollectDescription1")}</Text>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>{t("site.privacyPolicyWhatInformationWeCollectItem1")}</ListItem>
            <ListItem>{t("site.privacyPolicyWhatInformationWeCollectItem2")}</ListItem>
            <ListItem>{t("site.privacyPolicyWhatInformationWeCollectItem3")}</ListItem>
            <ListItem>{t("site.privacyPolicyWhatInformationWeCollectItem4")}</ListItem>
          </UnorderedList>
          <Text mt={4}>{t("site.privacyPolicyWhatInformationWeCollectDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyHowWeUseYourInformation")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyHowWeUseYourInformationDescription")}</Text>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>{t("site.privacyPolicyHowWeUseYourInformationItem1")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeUseYourInformationItem2")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeUseYourInformationItem3")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeUseYourInformationItem4")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeUseYourInformationItem5")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeUseYourInformationItem6")}</ListItem>
          </UnorderedList>
          <Text mt={4}>{t("site.privacyPolicyHowWeUseYourInformationDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyWhoCanAccessYourInformation")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyWhoCanAccessYourInformationDescription")}</Text>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>{t("site.privacyPolicyWhoCanAccessYourInformationItem1")}</ListItem>
            <ListItem>{t("site.privacyPolicyWhoCanAccessYourInformationItem2")}</ListItem>
            <ListItem>{t("site.privacyPolicyWhoCanAccessYourInformationItem3")}</ListItem>
          </UnorderedList>
          <Text mt={4}>{t("site.privacyPolicyWhoCanAccessYourInformationDescription2")}</Text>
          <Text mt={4}>{t("site.privacyPolicyWhoCanAccessYourInformationDescription3")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyHowWeProtectYourInformation")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyHowWeProtectYourInformationDescription")}</Text>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>{t("site.privacyPolicyHowWeProtectYourInformationItem1")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeProtectYourInformationItem2")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeProtectYourInformationItem3")}</ListItem>
            <ListItem>{t("site.privacyPolicyHowWeProtectYourInformationItem4")}</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyYourRights")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyYourRightsDescription")}</Text>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>{t("site.privacyPolicyYourRightsItem1")}</ListItem>
            <ListItem>{t("site.privacyPolicyYourRightsItem2")}</ListItem>
            <ListItem>{t("site.privacyPolicyYourRightsItem3")}</ListItem>
            <ListItem>{t("site.privacyPolicyYourRightsItem4")}</ListItem>
          </UnorderedList>
          <Text mt={4} mb={4}>
            {t("site.privacyPolicyYourRightsContactIntro")}
          </Text>
          <Text fontWeight="bold">{t("site.privacyPolicyYourRightsContactTitle")}</Text>
          <Text>{t("site.privacyPolicyYourRightsContactEmail")}</Text>
          <Text>{t("site.privacyPolicyYourRightsContactPhone")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyThirdPartyServicesAndIntegrations")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyThirdPartyServicesAndIntegrationsDescription1")}</Text>
          <Text>{t("site.privacyPolicyThirdPartyServicesAndIntegrationsDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyChangesToThisPolicy")}
          </Heading>
          <Text>{t("site.privacyPolicyChangesToThisPolicyDescription")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyContactUs")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyContactUsDescription")}</Text>
          <Text fontWeight="bold">{t("site.privacyPolicyContactUsTitle")}</Text>
          <Text>{t("site.privacyPolicyContactUsAddress1")}</Text>
          <Text>{t("site.privacyPolicyContactUsAddress2")}</Text>
          <Text>{t("site.privacyPolicyContactUsEmail")}</Text>
          <Text>{t("site.privacyPolicyContactUsPhone")}</Text>
        </Box>
      </VStack>
    </Container>
  )
}
