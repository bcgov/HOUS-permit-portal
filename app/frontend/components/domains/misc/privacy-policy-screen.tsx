import { Box, Container, Heading, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

const PrivacyPolicyList = ({ items }: { items: string[] }) => {
  const { t } = useTranslation()
  return (
    <UnorderedList spacing={2} pl={6}>
      {items.map((itemKey) => (
        <ListItem key={itemKey}>{t(itemKey)}</ListItem>
      ))}
    </UnorderedList>
  )
}

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
          <PrivacyPolicyList
            items={[
              "site.privacyPolicyWhatInformationWeCollectItem1",
              "site.privacyPolicyWhatInformationWeCollectItem2",
              "site.privacyPolicyWhatInformationWeCollectItem3",
              "site.privacyPolicyWhatInformationWeCollectItem4",
            ]}
          />
          <Text mt={4}>{t("site.privacyPolicyWhatInformationWeCollectDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyHowWeUseYourInformation")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyHowWeUseYourInformationDescription")}</Text>
          <PrivacyPolicyList
            items={[
              "site.privacyPolicyHowWeUseYourInformationItem1",
              "site.privacyPolicyHowWeUseYourInformationItem2",
              "site.privacyPolicyHowWeUseYourInformationItem3",
              "site.privacyPolicyHowWeUseYourInformationItem4",
              "site.privacyPolicyHowWeUseYourInformationItem5",
              "site.privacyPolicyHowWeUseYourInformationItem6",
            ]}
          />
          <Text mt={4}>{t("site.privacyPolicyHowWeUseYourInformationDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyWhoCanAccessYourInformation")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyWhoCanAccessYourInformationDescription")}</Text>
          <PrivacyPolicyList
            items={[
              "site.privacyPolicyWhoCanAccessYourInformationItem1",
              "site.privacyPolicyWhoCanAccessYourInformationItem2",
              "site.privacyPolicyWhoCanAccessYourInformationItem3",
            ]}
          />
          <Text mt={4}>{t("site.privacyPolicyWhoCanAccessYourInformationDescription2")}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyHowWeProtectYourInformation")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyHowWeProtectYourInformationDescription")}</Text>
          <PrivacyPolicyList
            items={[
              "site.privacyPolicyHowWeProtectYourInformationItem1",
              "site.privacyPolicyHowWeProtectYourInformationItem2",
              "site.privacyPolicyHowWeProtectYourInformationItem3",
              "site.privacyPolicyHowWeProtectYourInformationItem4",
            ]}
          />
        </Box>

        <Box>
          <Heading as="h2" size="lg" mt={8} mb={4}>
            {t("site.privacyPolicyYourRights")}
          </Heading>
          <Text mb={4}>{t("site.privacyPolicyYourRightsDescription")}</Text>
          <PrivacyPolicyList
            items={[
              "site.privacyPolicyYourRightsItem1",
              "site.privacyPolicyYourRightsItem2",
              "site.privacyPolicyYourRightsItem3",
              "site.privacyPolicyYourRightsItem4",
            ]}
          />
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
