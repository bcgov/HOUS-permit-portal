import { Container, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const LettersOfAssuranceScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="8">
        {t("home.projectReadinessTools.letterOfAssurancePage.whatAreLOAsTitle")}
      </Heading>
      <Text fontSize="lg" color="gray.600" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whatAreLOAsDescription1")}
      </Text>
      <Text fontSize="lg" color="gray.600" mb="8">
        {t("home.projectReadinessTools.letterOfAssurancePage.whatAreLOAsDescription2")}
      </Text>

      <Heading as="h2" size="lg" mt="8" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whoMustSubmitLOAsTitle")}
      </Heading>
      <Text fontSize="lg" color="gray.600" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whoMustSubmitLOAsDescription")}
      </Text>
      <UnorderedList spacing={2} fontSize="lg" color="gray.600" mb="8">
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.loaResponsibilities.buildingDesign")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.loaResponsibilities.structural")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.loaResponsibilities.mechanical")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.loaResponsibilities.plumbing")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.loaResponsibilities.fireSuppression")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.loaResponsibilities.geotechnical")}</ListItem>
      </UnorderedList>

      <Heading as="h2" size="lg" mt="8" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsTitle")}
      </Heading>
      <Text fontSize="lg" color="gray.600" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsDescription1")}
      </Text>
      <UnorderedList spacing={2} fontSize="lg" color="gray.600" mb="4" pl="4">
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsScheduleA")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsScheduleB")}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="gray.600" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsNotAllProjects")}
      </Text>
      <Text fontSize="lg" color="gray.600" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsEndOfConstruction")}
      </Text>
      <UnorderedList spacing={2} fontSize="lg" color="gray.600" mb="8" pl="4">
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsScheduleCA")}</ListItem>
        <ListItem>{t("home.projectReadinessTools.letterOfAssurancePage.whenToSubmitLOAsScheduleCB")}</ListItem>
      </UnorderedList>

      <Heading as="h2" size="lg" mt="8" mb="4">
        {t("home.projectReadinessTools.letterOfAssurancePage.howLOAsFitTitle")}
      </Heading>
      <Text fontSize="lg" color="gray.600">
        {t("home.projectReadinessTools.letterOfAssurancePage.howLOAsFitDescription")}
      </Text>
    </Container>
  )
}
