import { Box, Container, Divider, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"

export const OnboardingChecklistPageForLgAdoptingScreen = () => {
  const { t } = useTranslation()
  const prefix = "home.joinTheBuildingPermitHub"

  return (
    <Container maxW="container.lg" pb="36" px="8">
      {/* Title */}
      <Heading as="h1" mt="16" mb="6">
        {t(`${prefix}.title`)}
      </Heading>
      {/* Subtitle */}
      <Text fontSize="lg" fontStyle="italic" color="gray.700" mb="8">
        {t(`${prefix}.subtitle`)}
      </Text>
      <Divider mb={10} />

      {/* Our Vision */}
      <Heading as="h2" size="md" mb="6">
        {t(`${prefix}.ourVision.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="4">
        <Trans i18nKey="home.joinTheBuildingPermitHub.ourVision.description" />
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem>{t(`${prefix}.ourVision.audiences.localGovernments`)}</ListItem>
        <ListItem>{t(`${prefix}.ourVision.audiences.builders`)}</ListItem>
        <ListItem>{t(`${prefix}.ourVision.audiences.homeowners`)}</ListItem>
        <ListItem>{t(`${prefix}.ourVision.audiences.applicants`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mt={"8"}>
        <Trans i18nKey="home.joinTheBuildingPermitHub.ourVision.platformDescription" />
      </Text>
      <Text fontSize="lg" color="gray.700" mb="10">
        <Trans i18nKey="home.joinTheBuildingPermitHub.ourVision.mission" />
      </Text>
      <Text fontSize="lg" color="gray.700" mb="4">
        <Trans i18nKey="home.joinTheBuildingPermitHub.ourVision.flexibility" />
      </Text>
      <Text fontSize="lg" color="gray.700" mb="4">
        <Trans i18nKey="home.joinTheBuildingPermitHub.ourVision.standardizedPermits" />
      </Text>
      <Text fontSize="lg" color="gray.700" mb="10">
        <Trans i18nKey="home.joinTheBuildingPermitHub.ourVision.simpleSoftware" />
      </Text>
      <Divider mb={10} />
      {/* Where we are & What you can use today */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.currentStatus.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="4">
        <Trans i18nKey="home.joinTheBuildingPermitHub.currentStatus.description" />
      </Text>
      <Text mb={2} fontSize="lg">
        {t(`${prefix}.currentStatus.features.title`)}
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.currentStatus.features.smallScaleHousing" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.currentStatus.features.automatedStepCode" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.currentStatus.features.collaborativeFlows" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.currentStatus.features.customizablePermits" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.currentStatus.features.resubmissionTools" />
        </ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb="10">
        {t(`${prefix}.currentStatus.workflowNote`)}
      </Text>
      <Divider mb={10} />
      {/* Built together, with You */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.builtTogether.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700">
        {t(`${prefix}.builtTogether.description`)}
      </Text>
      <Text fontSize="lg" color="gray.700" mb="6">
        <Trans i18nKey="home.joinTheBuildingPermitHub.builtTogether.feedbackNote" />
      </Text>
      <Text fontSize="lg" mb={2}>
        {t(`${prefix}.builtTogether.communityFeatures.title`)}
      </Text>
      <UnorderedList mb={8} pl={6}>
        <ListItem>{t(`${prefix}.builtTogether.communityFeatures.multipleUploads`)}</ListItem>
        <ListItem>{t(`${prefix}.builtTogether.communityFeatures.fileScanning`)}</ListItem>
        <ListItem>{t(`${prefix}.builtTogether.communityFeatures.flexibleTools`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb="6">
        {t(`${prefix}.builtTogether.shareIdeas`)}
      </Text>
      <Heading as="h3" size="md">
        {t(`${prefix}.builtTogether.reachOutToStartTheConversation`)}
      </Heading>
      <Text fontSize="lg" color="gray.700">
        {t(`${prefix}.builtTogether.reachOutToStartTheConversationDescription`)}
      </Text>
      <Text fontSize="lg" color="gray.700">
        {t(`${prefix}.builtTogether.reachOutToStartTheConversationEmail`)}
      </Text>
      <Divider mb={10} />
      {/* What's coming next */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.whatsNext.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.whatsNext.timeline`)}
      </Text>
      <UnorderedList mb={8} pl={0} listStyleType="none">
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Text mr={2}>🗂️</Text>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.permitFolders.title`)}:</Text>
            <Text>{t(`${prefix}.whatsNext.features.permitFolders.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Text mr={2}>🧾</Text>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.readinessTools.title`)}:</Text>
            <Text>{t(`${prefix}.whatsNext.features.readinessTools.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Text mr={2}>📄</Text>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.documentUpload.title`)}:</Text>
            <Text>{t(`${prefix}.whatsNext.features.documentUpload.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Text mr={2}>🏠</Text>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.designCatalogues.title`)}:</Text>
            <Text>{t(`${prefix}.whatsNext.features.designCatalogues.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Text mr={2}>🌐</Text>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.dashboards.title`)}:</Text>
            <Text>{t(`${prefix}.whatsNext.features.dashboards.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start">
          <Text mr={2}>🔄</Text>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.statusTracking.title`)}:</Text>
            <Text>{t(`${prefix}.whatsNext.features.statusTracking.description`)}</Text>
          </Box>
        </ListItem>
      </UnorderedList>
      <Divider mb={10} />
      {/* Flexible Adoption to Fit You */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.flexibleAdoption.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.flexibleAdoption.description`)}
      </Text>
      <Text mb={2}>{t(`${prefix}.flexibleAdoption.examples.title`)}</Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.flexibleAdoption.examples.stepCode" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.flexibleAdoption.examples.specificTools" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.flexibleAdoption.examples.preApplication" />
        </ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb={8}>
        <Trans i18nKey="home.joinTheBuildingPermitHub.flexibleAdoption.note" />
      </Text>
      <Divider mb={10} />
      {/* Connected Through Integration */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.integration.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.integration.description`)}
      </Text>
      <UnorderedList mb={8} pl={6}>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.integration.features.openApi" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.integration.features.directPush" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.integration.features.statusUpdates" />
        </ListItem>
      </UnorderedList>
      <Divider mb={10} />
      {/* How to Get Started */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.getStarted.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.getStarted.description`)}
      </Text>
      <UnorderedList mb={2} pl={0} listStyleType="none">
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.getStarted.steps.learnMore.title`)}:</Text>
            <Text ml={4}>{t(`${prefix}.getStarted.steps.learnMore.guide`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.getStarted.steps.reachOut.title`)}:</Text>
            <Text ml={4}>
              {t(`${prefix}.getStarted.steps.reachOut.description`)}{" "}
              <Text as="span" color="blue.700">
                <Text mr={2}>📧 {t(`${prefix}.getStarted.steps.reachOut.email`)}</Text>
              </Text>
            </Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start">
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.getStarted.steps.beginOnboarding.title`)}:</Text>
            <Text ml={4}>{t(`${prefix}.getStarted.steps.beginOnboarding.description`)}</Text>
          </Box>
        </ListItem>
      </UnorderedList>

      {/* You're Not Alone */}
      <Heading as="h2" size="md" mb="4" mt={10}>
        {t(`${prefix}.notAlone.title`)}
      </Heading>
      <UnorderedList mb={2} pl={6}>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.notAlone.stats.liveJurisdictions" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.notAlone.stats.coCreation" />
        </ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb={8}>
        <Trans i18nKey="home.joinTheBuildingPermitHub.notAlone.feedback" />
      </Text>

      {/* Want to See More? */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.seeMore.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.seeMore.description`)}
      </Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>{t(`${prefix}.seeMore.options.demo`)}</ListItem>
        <ListItem>{t(`${prefix}.seeMore.options.technical`)}</ListItem>
        <ListItem>{t(`${prefix}.seeMore.options.success`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="blue.700" mb={1}>
        📧 <Trans i18nKey="home.joinTheBuildingPermitHub.seeMore.contact.email" />
      </Text>
      <Text fontSize="lg" color="gray.700" mb={8}>
        📧 <Trans i18nKey="home.joinTheBuildingPermitHub.seeMore.contact.sessions" />
      </Text>
    </Container>
  )
}
