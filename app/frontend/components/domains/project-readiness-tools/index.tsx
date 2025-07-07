import { Box, Container, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLink } from "../../shared/navigation/router-link"

export const ProjectReadinessToolsIndexScreen = () => {
  const { t } = useTranslation()
  const mailto = "mailto:" + t("site.contactEmail")
  const breadCrumbs = [
    {
      href: "/project-readiness-tools",
      title: t("site.breadcrumb.projectReadinessTools"),
    },
  ]

  const projectReadinessPageItems = [
    {
      sectionTitle: t("home.projectReadinessTools.checkYourProject"),
      items: [
        {
          linkText: t("home.projectReadinessTools.lookupStepCodeLink"),
          description: t("home.projectReadinessTools.lookupStepCodeDescription"),
          href: "#",
        },
        {
          linkText: t("home.projectReadinessTools.meetStepCodeLink"),
          description: t("home.projectReadinessTools.meetStepCodeDescription"),
          href: "/project-readiness-tools/check-step-code-requirements",
        },
        {
          linkText: t("home.projectReadinessTools.checkDrawingsLink"),
          description: t("home.projectReadinessTools.checkDrawingsDescription"),
          href: "#",
        },
      ],
    },
    {
      sectionTitle: t("home.projectReadinessTools.prepareYourApplication"),
      items: [
        {
          linkText: t("home.projectReadinessTools.signDocumentsLink"),
          description: t("home.projectReadinessTools.signDocumentsDescription"),
          href: "#",
        },
        {
          linkText: t("home.projectReadinessTools.letterOfAssuranceLink"),
          description: t("home.projectReadinessTools.createLoaDescription"),
          href: "/project-readiness-tools/create-your-letters-of-assurance",
        },
      ],
    },
  ]

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" color="text.primary">
        {t("home.projectReadinessTools.pageHeading")}
      </Heading>
      <Text pt="4" fontSize="lg" color="text.primary">
        {t("home.projectReadinessTools.pageDescription")}
      </Text>

      {projectReadinessPageItems.map((section, sectionIndex) => (
        <Box key={sectionIndex} mt="16">
          <Heading as="h2" size="lg" mb="8">
            {section.sectionTitle}
          </Heading>
          <VStack divider={<Divider borderColor="border.light" />} spacing={0} align="stretch">
            {section.items.map((item, itemIndex) => (
              <Box key={itemIndex} py="6" borderColor="border.light" mb={2}>
                <Flex justify="space-between" align="center" w="full">
                  <Box flex="1" pr="4">
                    <RouterLink to={item.href} color="text.link" fontWeight="semibold" fontSize="lg">
                      {item.linkText}
                    </RouterLink>
                    <Text mt="2" color="text.primary">
                      {item.description}
                    </Text>
                  </Box>
                  <RouterLink to={item.href} color="text.link" fontWeight="semibold" fontSize="lg">
                    <ArrowRight size={20} />
                  </RouterLink>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      ))}
    </Container>
  )
}
