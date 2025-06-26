import { Container, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"

export const LettersOfAssuranceScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("home.projectReadinessTools.letterOfAssurancePage.createYourLOAsTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.createYourLOAsIntro")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb="2">
        {t("home.projectReadinessTools.letterOfAssurancePage.createYourLOAsInstructions")}
      </Text>
      <UnorderedList mb={6} pl={6}>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.createYourLOAsInstructionFill")}</ListItem>
      </UnorderedList>

      <Heading as="h2" size="md" pt="5" pb="3">
        {t("home.projectReadinessTools.letterOfAssurancePage.whoThisIsForTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="2">
        {t("home.projectReadinessTools.letterOfAssurancePage.whoThisIsForDescription")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb="2">
        {t("home.projectReadinessTools.letterOfAssurancePage.whoThisIsForMayNeed")}
      </Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whoThisIsForComplex")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whoThisIsForSimpler")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whoThisIsForInvolves")}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="text.primary" mb={4}>
        <Trans
          i18nKey={"home.projectReadinessTools.letterOfAssurancePage.whoThisIsForCheckWithLG"}
          components={{
            1: (
              <Link
                href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/construction-industry/building-codes-and-standards/guides/2018guideloa.pdf"
                color="text.link"
                isExternal
              />
            ),
          }}
        />
      </Text>

      <Heading as="h2" size="md" pt="5" pb="3">
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitDescription")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitIfRequired")}
      </Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleA" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleB" />
        </ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitNotEvery")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitBeforeOccupy")}
      </Text>
      <UnorderedList mb={8} pl={6}>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleCA" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whenToSubmitScheduleCB" />
        </ListItem>
      </UnorderedList>

      <Heading as="h2" size="md" pt="5" pb="3">
        {t("home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverTitle")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={2}>
        {t("home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverDescription")}
      </Text>
      <UnorderedList mb={2} pl={6}>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverArchitect" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverStructural" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverMechanical" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverPlumbing" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverFire" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverGeotechnical" />
        </ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="text.primary" mb={8}>
        {t("home.projectReadinessTools.letterOfAssurancePage.whatLOAsCoverIfThree")}
      </Text>
      <Heading as="h2" size="md" pt="5" pb="3">
        {t("home.projectReadinessTools.letterOfAssurancePage.fillableLettersOfAssurance")}
      </Heading>

      <Link href="/pdfs/2024-LoA-Sch-A.pdf" color="text.link" fontWeight="bold" fontSize="lg" isExternal>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleAFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleADescription")}
      </Text>

      <Link href="/pdfs/2024-LoA-Sch-B.pdf" color="text.link" fontWeight="bold" fontSize="lg" isExternal>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleBFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleBDescription")}
      </Text>

      <Link href="/pdfs/2024-LoA-Sch-C-A.pdf" color="text.link" fontWeight="bold" fontSize="lg" isExternal>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleCAFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleCADescription")}
      </Text>

      <Link href="/pdfs/2024-LoA-Sch-C-B.pdf" color="text.link" fontWeight="bold" fontSize="lg" isExternal>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleCBFileLink")}
      </Link>
      <Text mt={1} mb={8}>
        {t("home.projectReadinessTools.letterOfAssurancePage.scheduleCBDescription")}
      </Text>

      <Heading as="h2" size="lg" pt="5" pb="3">
        {t("home.projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceTitle")}
      </Heading>
      <Text mb={4} fontSize="lg">
        {t("home.projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceDescription")}
      </Text>
      <UnorderedList spacing={2} fontSize="lg" pl={4}>
        <ListItem>
          <Link href="https://bccodes.ca/letters-of-assurance.html" color="text.link" isExternal>
            {t("home.projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceLink")}
          </Link>
        </ListItem>
        <ListItem>
          <Link
            href="https://free.bcpublications.ca/civix/content/public/bcbc2012/1703883894/?xsl=/templates/browse.xsl"
            color="text.link"
            isExternal
          >
            {t("home.projectReadinessTools.letterOfAssurancePage.previousLettersOfAssuranceLink2")}
          </Link>
        </ListItem>
      </UnorderedList>
    </Container>
  )
}
