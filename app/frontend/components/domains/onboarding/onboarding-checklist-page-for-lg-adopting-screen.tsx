import { Container, Heading, List, Text } from "@chakra-ui/react"
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
      <List.Root as="ul" mb={4} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.about.audiences.localGovernments`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.about.audiences.builders`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.about.audiences.homeowners`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.about.audiences.anyone`)}</List.Item>
      </List.Root>
      <Text fontSize="md" color="gray.700" mb="4">
        <Trans i18nKey={`${prefix}.about.freeAndVoluntary`} />
      </Text>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.about.workingTo`)}
      </Text>
      <List.Root as="ul" mb={4} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.about.goals.speedUp`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.about.goals.support`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.about.goals.reduce`)}</List.Item>
      </List.Root>
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
      <List.Root as="ul" mb={10} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.availableFeatures.features.permitApplications`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.availableFeatures.features.automatedStepCodes`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.availableFeatures.features.collaborativeWorkflows`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.availableFeatures.features.customizablePermits`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.availableFeatures.features.resubmissionTools`)}</List.Item>
      </List.Root>
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
      <List.Root as="ul" mb={10} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.coDeveloped.recentFeatures.multipleFiles`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.coDeveloped.recentFeatures.maliciousFiles`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.coDeveloped.recentFeatures.collaborationTools`)}</List.Item>
      </List.Root>
      {/* New features in development */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.newFeatures.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.newFeatures.description`)}
      </Text>
      <List.Root as="ul" mb={10} pl={0} listStyleType="none">
        <List.Item mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.permitProjectFolders.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.permitProjectFolders.description`)}</Text>
        </List.Item>
        <List.Item mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.preApplicationTools.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.preApplicationTools.description`)}</Text>
        </List.Item>
        <List.Item mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.uploadDocuments.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.uploadDocuments.description`)}</Text>
        </List.Item>
        <List.Item mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.standardHousing.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.standardHousing.description`)}</Text>
        </List.Item>
        <List.Item mb={4}>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.crossJurisdiction.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.crossJurisdiction.description`)}</Text>
        </List.Item>
        <List.Item>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.newFeatures.features.realTimeStatus.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.newFeatures.features.realTimeStatus.description`)}</Text>
        </List.Item>
      </List.Root>
      {/* Flexible use and adoption */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.flexibleUse.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="2">
        {t(`${prefix}.flexibleUse.description`)}
      </Text>
      <List.Root as="ul" mb={4} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.flexibleUse.examples.stepCode`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.flexibleUse.examples.newFeatures`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.flexibleUse.examples.preApplication`)}</List.Item>
      </List.Root>
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
      <List.Root as="ul" mb={10} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.integration.features.openApi`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.integration.features.automaticTransfer`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.integration.features.comingSoon`)}</List.Item>
      </List.Root>
      {/* How to join */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.howToJoin.title`)}
      </Heading>
      <List.Root as="ol" mb={10} pl={6} gap={3}>
        <List.Item>
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
        </List.Item>
        <List.Item>
          <Heading as="h3" fontWeight="bold" fontSize="md">
            {t(`${prefix}.howToJoin.step2.title`)}
          </Heading>
          <Text fontSize="md">{t(`${prefix}.howToJoin.step2.description`)}</Text>
        </List.Item>
      </List.Root>
      {/* Learn more about Building Permit Hub */}
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {t(`${prefix}.learnMore.title`)}
      </Heading>
      <Text fontSize="md" color="gray.700" mb="4">
        {t(`${prefix}.learnMore.description`)}
      </Text>
      <List.Root as="ul" mb={4} pl={6}>
        <List.Item fontSize="md">{t(`${prefix}.learnMore.options.liveOnboarding`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.learnMore.options.liveDemo`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.learnMore.options.technicalQuestions`)}</List.Item>
        <List.Item fontSize="md">{t(`${prefix}.learnMore.options.share`)}</List.Item>
      </List.Root>
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
