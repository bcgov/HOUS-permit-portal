import { Container, Divider, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

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
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.ourVision.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="4">
        {t(`${prefix}.ourVision.description`)}
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem>{t(`${prefix}.ourVision.audiences.localGovernments`)}</ListItem>
        <ListItem>{t(`${prefix}.ourVision.audiences.builders`)}</ListItem>
        <ListItem>{t(`${prefix}.ourVision.audiences.homeowners`)}</ListItem>
        <ListItem>{t(`${prefix}.ourVision.audiences.applicants`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb="4">
        {t(`${prefix}.ourVision.platformDescription`)}
      </Text>
      <Text fontSize="lg" color="gray.700" mb="4">
        {t(`${prefix}.ourVision.mission`)}
      </Text>
      <Text fontSize="lg" color="gray.700" mb="10">
        {t(`${prefix}.ourVision.flexibility`)}
      </Text>

      {/* Where we are & What you can use today */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.currentStatus.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="4">
        {t(`${prefix}.currentStatus.description`)}
      </Text>
      <Text fontWeight="bold" mb={2}>
        {t(`${prefix}.currentStatus.features.title`)}
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem>{t(`${prefix}.currentStatus.features.smallScaleHousing`)}</ListItem>
        <ListItem>{t(`${prefix}.currentStatus.features.automatedStepCode`)}</ListItem>
        <ListItem>{t(`${prefix}.currentStatus.features.collaborativeFlows`)}</ListItem>
        <ListItem>{t(`${prefix}.currentStatus.features.customizablePermits`)}</ListItem>
        <ListItem>{t(`${prefix}.currentStatus.features.resubmissionTools`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb="10">
        {t(`${prefix}.currentStatus.workflowNote`)}
      </Text>

      {/* Built together, with You */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.builtTogether.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.builtTogether.description`)}
      </Text>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.builtTogether.feedbackNote`)}
      </Text>
      <Text fontWeight="bold" mb={2}>
        {t(`${prefix}.builtTogether.communityFeatures.title`)}
      </Text>
      <UnorderedList mb={8} pl={6}>
        <ListItem>{t(`${prefix}.builtTogether.communityFeatures.multipleUploads`)}</ListItem>
        <ListItem>{t(`${prefix}.builtTogether.communityFeatures.fileScanning`)}</ListItem>
        <ListItem>{t(`${prefix}.builtTogether.communityFeatures.flexibleTools`)}</ListItem>
      </UnorderedList>

      {/* What's coming next */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.whatsNext.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.whatsNext.timeline`)}
      </Text>
      <UnorderedList mb={8} pl={6}>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.whatsNext.features.permitFolders.title`)}:
          </Text>{" "}
          {t(`${prefix}.whatsNext.features.permitFolders.description`)}
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.whatsNext.features.readinessTools.title`)}:
          </Text>{" "}
          {t(`${prefix}.whatsNext.features.readinessTools.description`)}
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.whatsNext.features.documentUpload.title`)}:
          </Text>{" "}
          {t(`${prefix}.whatsNext.features.documentUpload.description`)}
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.whatsNext.features.designCatalogues.title`)}:
          </Text>{" "}
          {t(`${prefix}.whatsNext.features.designCatalogues.description`)}
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.whatsNext.features.dashboards.title`)}:
          </Text>{" "}
          {t(`${prefix}.whatsNext.features.dashboards.description`)}
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.whatsNext.features.statusTracking.title`)}:
          </Text>{" "}
          {t(`${prefix}.whatsNext.features.statusTracking.description`)}
        </ListItem>
      </UnorderedList>

      {/* Flexible Adoption to Fit You */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.flexibleAdoption.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.flexibleAdoption.description`)}
      </Text>
      <Text fontWeight="bold" mb={2}>
        {t(`${prefix}.flexibleAdoption.examples.title`)}
      </Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>{t(`${prefix}.flexibleAdoption.examples.stepCode`)}</ListItem>
        <ListItem>{t(`${prefix}.flexibleAdoption.examples.specificTools`)}</ListItem>
        <ListItem>{t(`${prefix}.flexibleAdoption.examples.preApplication`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb={8}>
        {t(`${prefix}.flexibleAdoption.note`)}
      </Text>

      {/* Connected Through Integration */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.integration.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.integration.description`)}
      </Text>
      <UnorderedList mb={8} pl={6}>
        <ListItem>{t(`${prefix}.integration.features.openApi`)}</ListItem>
        <ListItem>{t(`${prefix}.integration.features.directPush`)}</ListItem>
        <ListItem>{t(`${prefix}.integration.features.statusUpdates`)}</ListItem>
      </UnorderedList>

      {/* How to Get Started */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.getStarted.title`)}
      </Heading>
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.getStarted.description`)}
      </Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.getStarted.steps.learnMore.title`)}:
          </Text>{" "}
          {t(`${prefix}.getStarted.steps.learnMore.guide`)}
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.getStarted.steps.reachOut.title`)}:
          </Text>{" "}
          {t(`${prefix}.getStarted.steps.reachOut.description`)}{" "}
          <Text as="span" color="blue.700">
            {t(`${prefix}.getStarted.steps.reachOut.email`)}
          </Text>
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            {t(`${prefix}.getStarted.steps.beginOnboarding.title`)}:
          </Text>{" "}
          {t(`${prefix}.getStarted.steps.beginOnboarding.description`)}
        </ListItem>
      </UnorderedList>

      {/* You're Not Alone */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.notAlone.title`)}
      </Heading>
      <UnorderedList mb={2} pl={6}>
        <ListItem>{t(`${prefix}.notAlone.stats.liveJurisdictions`)}</ListItem>
        <ListItem>{t(`${prefix}.notAlone.stats.coCreation`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.700" mb={8}>
        {t(`${prefix}.notAlone.feedback`)}
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
        {t(`${prefix}.seeMore.contact.email`)}
      </Text>
      <Text fontSize="lg" color="gray.700" mb={1}>
        {t(`${prefix}.seeMore.contact.phone`)}
      </Text>
      <Text fontSize="lg" color="gray.700" mb={8}>
        {t(`${prefix}.seeMore.contact.sessions`)}
      </Text>
    </Container>
  )
}
