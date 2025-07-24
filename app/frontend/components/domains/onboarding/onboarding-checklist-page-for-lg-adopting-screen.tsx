import { Box, Container, Divider, Heading, Image, ListItem, OrderedList, Text, UnorderedList } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const OnboardingChecklistPageForLgAdoptingScreen = observer(() => {
  const { t } = useTranslation()
  const prefix = "home.joinTheBuildingPermitHub"

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t(`${prefix}.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="8">
        {t(`${prefix}.subtitle`)}
      </Text>

      {/* Our Vision */}
      <Heading as="h2" size="md" mb="6">
        {t(`${prefix}.ourVision.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="4">
        <Trans i18nKey={`${prefix}.about.description`} />
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem fontSize="md">{t(`${prefix}.about.audiences.localGovernments`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.about.audiences.builders`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.about.audiences.homeowners`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.about.audiences.anyone`)}</ListItem>
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
        <ListItem fontSize="md">{t(`${prefix}.about.goals.speedUp`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.about.goals.support`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.about.goals.reduce`)}</ListItem>
      </UnorderedList>
      <Text fontSize="md" color="gray.700" mb="10">
        <Trans i18nKey={`${prefix}.about.flexible`} />
      </Text>

      {/* Available features */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.availableFeatures.title`)}
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
      <Text fontSize="lg" color="gray.700" mb="6">
        {t(`${prefix}.builtTogether.reachOutToStartTheConversationEmail`)}
      </Text>
      <Divider mb={10} />
      {/* What's coming next */}
      <Heading as="h2" size="md" mb="4">
        {t(`${prefix}.whatsNext.title`)}
      </Heading>
      <Image src={`/images/whats-coming-next.jpeg`} alt="What's coming next" mb="12" />
      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.whatsNext.timeline`)}
      </Text>
      <UnorderedList mb={8} pl={0} listStyleType="none">
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.permitFolders.title`)}</Text>
            <Text>{t(`${prefix}.whatsNext.features.permitFolders.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.readinessTools.title`)}</Text>
            <Text>{t(`${prefix}.whatsNext.features.readinessTools.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.documentUpload.title`)}</Text>
            <Text>{t(`${prefix}.whatsNext.features.documentUpload.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.designCatalogues.title`)}</Text>
            <Text>{t(`${prefix}.whatsNext.features.designCatalogues.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.dashboards.title`)}</Text>
            <Text>{t(`${prefix}.whatsNext.features.dashboards.description`)}</Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start">
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.whatsNext.features.statusTracking.title`)}</Text>
            <Text>{t(`${prefix}.whatsNext.features.statusTracking.description`)}</Text>
          </Box>
        </ListItem>
      </UnorderedList>

      {/* New features in development */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.newFeatures.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.newFeatures.description`)}
      </Text>
      <UnorderedList mb={10} pl={0} listStyleType="none">
        <ListItem mb={4}>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.permitProjectFolders.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.permitProjectFolders.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.preApplicationTools.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.preApplicationTools.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.uploadDocuments.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.uploadDocuments.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.standardHousing.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.standardHousing.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.crossJurisdiction.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.crossJurisdiction.description`)}</Text>
        </ListItem>
        <ListItem>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.realTimeStatus.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.realTimeStatus.description`)}</Text>
        </ListItem>
      </UnorderedList>

      {/* Flexible use and adoption */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.flexibleUse.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="2">
        {t(`${prefix}.flexibleUse.description`)}
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem fontSize="md">{t(`${prefix}.flexibleUse.examples.stepCode`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.flexibleUse.examples.newFeatures`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.flexibleUse.examples.preApplication`)}</ListItem>
      </UnorderedList>
      <Text fontSize="md" color="gray.700" mb="10">
        <Trans i18nKey={`${prefix}.flexibleUse.note`} />
      </Text>

      {/* Integration with your existing systems */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.integration.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="2">
        {t(`${prefix}.integration.description`)}
      </Text>
      <Text mb={2} fontSize="md">
        {t(`${prefix}.integration.includes`)}
      </Text>
      <UnorderedList mb={2} pl={0} listStyleType="none">
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.getStarted.steps.learnMore.title`)}</Text>
            <Text ml={4}>
              <Trans
                i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.learnMore.guide"
                components={{
                  1: (
                    <Link
                      to={
                        "https://www2.gov.bc.ca/gov/content/housing-tenancy/building-or-renovating/permits/building-permit-hub"
                      }
                      target="_blank"
                      style={{ color: "#1a5a96", textDecoration: "underline" }}
                    />
                  ),
                }}
              />
            </Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start" mb={4}>
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.getStarted.steps.reachOut.title`)}</Text>
            <Text ml={4}>
              {t(`${prefix}.getStarted.steps.reachOut.description`)}{" "}
              <Text as="span" color="blue.700">
                <Text mr={2}>
                  📧{" "}
                  <Link
                    to={`mailto:${t(`${prefix}.getStarted.steps.reachOut.email`)}`}
                    style={{ color: "#1a5a96", textDecoration: "underline" }}
                  >
                    {t(`${prefix}.getStarted.steps.reachOut.email`)}
                  </Link>
                </Text>
              </Text>
            </Text>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="flex-start">
          <Box>
            <Text fontWeight="bold">{t(`${prefix}.getStarted.steps.beginOnboarding.title`)}</Text>
            <Text ml={4}>{t(`${prefix}.getStarted.steps.beginOnboarding.description`)}</Text>
          </Box>
        </ListItem>
      </UnorderedList>

      <Text fontSize="lg" color="gray.700" mb="2">
        {t(`${prefix}.getStarted.steps.onboardingProcess.title`)}
      </Text>
      <OrderedList mb={2} pl={6}>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.onboardingProcess.steps.introduction" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.onboardingProcess.steps.training" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.onboardingProcess.steps.initialFeedback" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.onboardingProcess.steps.assistance" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.onboardingProcess.steps.support" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.joinTheBuildingPermitHub.getStarted.steps.onboardingProcess.steps.continuousFeedback" />
        </ListItem>
      </OrderedList>

      {/* You're Not Alone */}
      <Heading as="h2" size="md" mb="4" mt={10}>
        {t(`${prefix}.notAlone.title`)}
      </Heading>
      <OrderedList mb={10} pl={6} spacing={3}>
        <ListItem>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.howToJoin.step1.title`)}
          </Text>
          <Text fontSize="md">
            <Trans
              i18nKey={`${prefix}.howToJoin.step1.description`}
              values={{ email: t(`${prefix}.howToJoin.step1.email`) }}
              components={{
                mailTo: (
                  <Link
                    to={`mailto:${t(`${prefix}.howToJoin.step1.email`)}`}
                    style={{ color: "#1a5a96", textDecoration: "underline" }}
                  />
                ),
              }}
            />
          </Text>
        </ListItem>
        <ListItem>
          <Text fontWeight="bold" fontSize="md">
            {t(`${prefix}.howToJoin.step2.title`)}
          </Text>
          <Text fontSize="md">{t(`${prefix}.howToJoin.step2.description`)}</Text>
        </ListItem>
      </OrderedList>

      {/* Learn more about Building Permit Hub */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.learnMore.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.learnMore.description`)}
      </Text>
      <UnorderedList mb={4} pl={6}>
        <ListItem fontSize="md">{t(`${prefix}.learnMore.options.liveOnboarding`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.learnMore.options.liveDemo`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.learnMore.options.technicalQuestions`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.learnMore.options.share`)}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="blue.700" mb={1}>
        📧{" "}
        <Link
          to={`mailto:${t(`${prefix}.seeMore.contact.email`)}`}
          style={{ color: "#1a5a96", textDecoration: "underline" }}
        >
          {t(`${prefix}.seeMore.contact.email`)}
        </Link>
      </Text>
      <Text fontSize="lg" color="gray.700" mb={8}>
        <Trans i18nKey="home.joinTheBuildingPermitHub.seeMore.contact.sessions" />
      </Text>
    </Container>
  )
})
