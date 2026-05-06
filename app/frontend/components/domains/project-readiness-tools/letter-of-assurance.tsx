import { Container, Heading, Link, List, Text } from "@chakra-ui/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"

export const LettersOfAssuranceScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("projectReadinessTools.letterOfAssurancePage.createYourLOAsTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="4">
        {t("projectReadinessTools.letterOfAssurancePage.createYourLOAsIntro")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb="2">
        {t("projectReadinessTools.letterOfAssurancePage.createYourLOAsInstructions")}
      </Text>
      <List.Root as="ul" mb={6} pl={6} fontSize="lg">
        <List.Item>{t("projectReadinessTools.letterOfAssurancePage.createYourLOAsInstructionFill")}</List.Item>
      </List.Root>
      <Heading as="h2" size="md" pt="5" pb="3">
        {t("projectReadinessTools.letterOfAssurancePage.whoThisIsForTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="2">
        {t("projectReadinessTools.letterOfAssurancePage.whoThisIsForDescription")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb="2">
        {t("projectReadinessTools.letterOfAssurancePage.whoThisIsForMayNeed")}
      </Text>
      <List.Root as="ul" mb={2} pl={6} fontSize="lg">
        <List.Item>{t("projectReadinessTools.letterOfAssurancePage.whoThisIsForComplex")}</List.Item>
        <List.Item>{t("projectReadinessTools.letterOfAssurancePage.whoThisIsForSimpler")}</List.Item>
        <List.Item>{t("projectReadinessTools.letterOfAssurancePage.whoThisIsForInvolves")}</List.Item>
      </List.Root>
      <Text fontSize="lg" color="text.primary" mb={4}>
        <Trans
          i18nKey={"projectReadinessTools.letterOfAssurancePage.whoThisIsForCheckWithLG"}
          components={{
            1: (
              <Link
                href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/construction-industry/building-codes-and-standards/guides/2018guideloa.pdf"
                color="text.link"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </Text>
      <Heading as="h2" size="md" pt="5" pb="3">
        {t("projectReadinessTools.letterOfAssurancePage.whenToSubmitTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("projectReadinessTools.letterOfAssurancePage.whenToSubmitDescription")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("projectReadinessTools.letterOfAssurancePage.whenToSubmitIfRequired")}
      </Text>
      <List.Root as="ul" mb={2} pl={6} fontSize="lg">
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleA" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleB" />
        </List.Item>
      </List.Root>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("projectReadinessTools.letterOfAssurancePage.whenToSubmitNotEvery")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("projectReadinessTools.letterOfAssurancePage.whenToSubmitBeforeOccupy")}
      </Text>
      <List.Root as="ul" mb={8} pl={6} fontSize="lg">
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleCA" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleCB" />
        </List.Item>
      </List.Root>
      <Heading as="h2" size="md" pt="5" pb="3">
        {t("projectReadinessTools.letterOfAssurancePage.whatLOAsCoverTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("projectReadinessTools.letterOfAssurancePage.whatLOAsCoverDescription")}
      </Text>
      <List.Root as="ul" mb={2} pl={6} fontSize="lg">
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whatLOAsCoverArchitect" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whatLOAsCoverStructural" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whatLOAsCoverMechanical" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whatLOAsCoverPlumbing" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whatLOAsCoverFire" />
        </List.Item>
        <List.Item>
          <Trans i18nKey="projectReadinessTools.letterOfAssurancePage.whatLOAsCoverGeotechnical" />
        </List.Item>
      </List.Root>
      <Text fontSize="lg" color="text.primary" mb={8}>
        {t("projectReadinessTools.letterOfAssurancePage.whatLOAsCoverIfThree")}
      </Text>
      <Heading as="h2" size="md" pt="5" pb="3">
        {t("projectReadinessTools.letterOfAssurancePage.fillableLettersOfAssurance")}
      </Heading>
      <Link
        href="/pdfs/2024-LoA-Sch-A.pdf"
        color="text.link"
        fontWeight="bold"
        fontSize="lg"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("projectReadinessTools.letterOfAssurancePage.scheduleAFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("projectReadinessTools.letterOfAssurancePage.scheduleADescription")}
      </Text>
      <Link
        href="/pdfs/2024-LoA-Sch-B.pdf"
        color="text.link"
        fontWeight="bold"
        fontSize="lg"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("projectReadinessTools.letterOfAssurancePage.scheduleBFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("projectReadinessTools.letterOfAssurancePage.scheduleBDescription")}
      </Text>
      <Link
        href="/pdfs/2024-LoA-Sch-C-A.pdf"
        color="text.link"
        fontWeight="bold"
        fontSize="lg"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("projectReadinessTools.letterOfAssurancePage.scheduleCAFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("projectReadinessTools.letterOfAssurancePage.scheduleCADescription")}
      </Text>
      <Link
        href="/pdfs/2024-LoA-Sch-C-B.pdf"
        color="text.link"
        fontWeight="bold"
        fontSize="lg"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("projectReadinessTools.letterOfAssurancePage.scheduleCBFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("projectReadinessTools.letterOfAssurancePage.scheduleCBDescription")}
      </Text>
      <Heading as="h2" size="lg" pt="5" pb="3">
        {t("projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceTitle")}
      </Heading>
      <Text mb={4} fontSize="lg">
        {t("projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceDescription")}
      </Text>
      <List.Root as="ul" gap={2} fontSize="lg" pl={4}>
        <List.Item>
          <Link
            href="https://bccodes.ca/letters-of-assurance.html"
            color="text.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceLink")}
          </Link>
        </List.Item>
        <List.Item>
          <Link
            href="https://free.bcpublications.ca/civix/content/public/bcbc2012/1703883894/?xsl=/templates/browse.xsl"
            color="text.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceLink2")}
          </Link>
        </List.Item>
      </List.Root>
    </Container>
  )
}
