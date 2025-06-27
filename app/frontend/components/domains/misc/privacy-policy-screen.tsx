import { Box, Container, Heading, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

const PrivacyPolicyList = ({ items }: { items: string[] }) => {
  const { t } = useTranslation()
  return (
    <UnorderedList spacing={2} pl={6}>
      {items.map((itemKey) => (
        <ListItem key={itemKey}>{t(itemKey as any)}</ListItem>
      ))}
    </UnorderedList>
  )
}

interface PrivacyPolicySectionProps {
  headingKey: string
  descriptionKey: string
  listItems: string[]
  description2Key?: string
}

const PrivacyPolicySection: React.FC<PrivacyPolicySectionProps> = ({
  headingKey,
  descriptionKey,
  listItems,
  description2Key,
}) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Heading as="h2" size="lg" mt={8} mb={4}>
        {t(headingKey as any)}
      </Heading>
      <Text mb={4}>{t(descriptionKey as any)}</Text>
      <PrivacyPolicyList items={listItems} />
      {description2Key && <Text mt={4}>{t(description2Key as any)}</Text>}
    </Box>
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

        <PrivacyPolicySection
          headingKey="site.privacyPolicyWhatInformationWeCollect"
          descriptionKey="site.privacyPolicyWhatInformationWeCollectDescription1"
          listItems={[
            "site.privacyPolicyWhatInformationWeCollectItem1",
            "site.privacyPolicyWhatInformationWeCollectItem2",
            "site.privacyPolicyWhatInformationWeCollectItem3",
            "site.privacyPolicyWhatInformationWeCollectItem4",
          ]}
          description2Key="site.privacyPolicyWhatInformationWeCollectDescription2"
        />

        <PrivacyPolicySection
          headingKey="site.privacyPolicyHowWeUseYourInformation"
          descriptionKey="site.privacyPolicyHowWeUseYourInformationDescription"
          listItems={[
            "site.privacyPolicyHowWeUseYourInformationItem1",
            "site.privacyPolicyHowWeUseYourInformationItem2",
            "site.privacyPolicyHowWeUseYourInformationItem3",
            "site.privacyPolicyHowWeUseYourInformationItem4",
            "site.privacyPolicyHowWeUseYourInformationItem5",
            "site.privacyPolicyHowWeUseYourInformationItem6",
          ]}
          description2Key="site.privacyPolicyHowWeUseYourInformationDescription2"
        />

        <PrivacyPolicySection
          headingKey="site.privacyPolicyWhoCanAccessYourInformation"
          descriptionKey="site.privacyPolicyWhoCanAccessYourInformationDescription"
          listItems={[
            "site.privacyPolicyWhoCanAccessYourInformationItem1",
            "site.privacyPolicyWhoCanAccessYourInformationItem2",
            "site.privacyPolicyWhoCanAccessYourInformationItem3",
          ]}
          description2Key="site.privacyPolicyWhoCanAccessYourInformationDescription2"
        />

        <PrivacyPolicySection
          headingKey="site.privacyPolicyHowWeProtectYourInformation"
          descriptionKey="site.privacyPolicyHowWeProtectYourInformationDescription"
          listItems={[
            "site.privacyPolicyHowWeProtectYourInformationItem1",
            "site.privacyPolicyHowWeProtectYourInformationItem2",
            "site.privacyPolicyHowWeProtectYourInformationItem3",
            "site.privacyPolicyHowWeProtectYourInformationItem4",
          ]}
        />

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
