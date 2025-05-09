import { Container, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import i18next from "i18next"
import React from "react"
import { useTranslation } from "react-i18next"
import { SubNavBar } from "../navigation/sub-nav-bar"

export const LettersOfAssuranceScreen = () => {
  const { t } = useTranslation()
  const mailto = "mailto:" + t("site.contactEmail")
  const breadCrumbs = [
    {
      href: "/project-readiness-tools",
      title: t("site.breadcrumb.projectReadinessTools"),
    },
  ]

  const contactTeamInstructions = i18next.t("site.contactTeamInstructions", {
    returnObjects: true,
  }) as string[]

  const newContentItems = [
    {
      sectionTitle: t("home.projectReadinessTools.sectionTitle"),
      items: [
        {
          linkText: t("home.projectReadinessTools.letterOfAssuranceLink"),
          description: t("home.projectReadinessTools.letterOfAssuranceDescription"),
          href: "project-readiness-tools/letters-of-assurance",
        },
      ],
    },
  ]

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <SubNavBar
        staticBreadCrumbs={breadCrumbs}
        breadCrumbContainerProps={{ px: 0, sx: { ol: { pl: 0 } } }}
        borderBottom={"none"}
      />
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
