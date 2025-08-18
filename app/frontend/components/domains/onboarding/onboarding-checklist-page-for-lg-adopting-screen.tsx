import { Container, Heading, ListItem, OrderedList, Text, UnorderedList } from "@chakra-ui/react"
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

      {/* About Building Permit Hub */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.about.title`)}
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
      <Text fontSize="md" color="gray.700" mb="4">
        <Trans i18nKey={`${prefix}.about.freeAndVoluntary`} />
      </Text>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.about.workingTo`)}
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
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.availableFeatures.description`)}
      </Text>
      <Text mb={2} fontSize="md">
        {t(`${prefix}.availableFeatures.features.title`)}
      </Text>
      <UnorderedList mb={10} pl={6}>
        <ListItem fontSize="md">{t(`${prefix}.availableFeatures.features.permitApplications`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.availableFeatures.features.automatedStepCodes`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.availableFeatures.features.collaborativeWorkflows`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.availableFeatures.features.customizablePermits`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.availableFeatures.features.resubmissionTools`)}</ListItem>
      </UnorderedList>

      {/* Co-developed with BC communities */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.coDeveloped.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.coDeveloped.description`)}
      </Text>
      <Text mb={2} fontSize="md">
        {t(`${prefix}.coDeveloped.recentFeatures.title`)}
      </Text>
      <UnorderedList mb={10} pl={6}>
        <ListItem fontSize="md">{t(`${prefix}.coDeveloped.recentFeatures.multipleFiles`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.coDeveloped.recentFeatures.maliciousFiles`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.coDeveloped.recentFeatures.collaborationTools`)}</ListItem>
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
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.permitProjectFolders.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.permitProjectFolders.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.preApplicationTools.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.preApplicationTools.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.uploadDocuments.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.uploadDocuments.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.standardHousing.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.standardHousing.description`)}</Text>
        </ListItem>
        <ListItem mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.crossJurisdiction.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.crossJurisdiction.description`)}</Text>
        </ListItem>
        <ListItem>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.realTimeStatus.title`)}
          </Heading>
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
      <UnorderedList mb={10} pl={6}>
        <ListItem fontSize="md">{t(`${prefix}.integration.features.openApi`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.integration.features.automaticTransfer`)}</ListItem>
        <ListItem fontSize="md">{t(`${prefix}.integration.features.comingSoon`)}</ListItem>
      </UnorderedList>

      {/* How to join */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.howToJoin.title`)}
      </Heading>
      <OrderedList mb={10} pl={6} spacing={3}>
        <ListItem>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.howToJoin.step1.title`)}
          </Heading>
          <Text fontSize="md">
            <Trans
              i18nKey={`${prefix}.howToJoin.step1.description`}
              values={{ email: t(`${prefix}.howToJoin.step1.emailText`) }}
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
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.howToJoin.step2.title`)}
          </Heading>
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
      <Text fontSize="md" color="gray.700" mb="8">
        <Trans
          i18nKey={`${prefix}.learnMore.contact`}
          values={{ email: t(`${prefix}.learnMore.emailText`) }}
          components={{
            mailTo: (
              <Link
                to={`mailto:${t(`${prefix}.learnMore.email`)}`}
                style={{ color: "#1a5a96", textDecoration: "underline" }}
              />
            ),
          }}
        />
      </Text>
    </Container>
  )
})
