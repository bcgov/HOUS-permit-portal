import { Box, Container, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLink } from "../../shared/navigation/router-link"

export const ProjectReadinessToolsIndexScreen = () => {
  const { t } = useTranslation()

  const projectReadinessPageItems = [
    {
      sectionTitle: t("home.projectReadinessTools.checkYourProjectAgainstProvincialRegulations"),
      items: [
        {
          linkText: t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProject"),
          description: t("home.projectReadinessTools.lookUpToolProjectDescription"),
          href: "/project-readiness-tools/look-up-step-codes-requirements-for-your-project",
        },
        {
          linkText: t("projectReadinessTools.meetStepCodeLink"),
          description: t("projectReadinessTools.meetStepCodeDescription"),
          href: "/project-readiness-tools/check-step-code-requirements",
        },
        {
          linkText: t("projectReadinessTools.preCheckDrawingsLink"),
          description: t("projectReadinessTools.preCheckDrawingsDescription"),
          href: "/project-readiness-tools/pre-check",
        },
        {
          linkText: t("projectReadinessTools.digitalSealValidator.title"),
          description: t("projectReadinessTools.digitalSealValidator.descriptionToolPage"),
          href: "/project-readiness-tools/check-digital-seals",
        },
      ],
    },
    {
      sectionTitle: t("projectReadinessTools.prepareYourApplication"),
      items: [
        // {
        //   linkText: t("projectReadinessTools.signDocumentsLink"),
        //   description: t("projectReadinessTools.signDocumentsDescription"),
        //   href: "#",
        // },
        {
          linkText: t("projectReadinessTools.letterOfAssuranceLink"),
          description: t("projectReadinessTools.createLoaDescription"),
          href: "/project-readiness-tools/create-your-letters-of-assurance",
        },
        {
          linkText: t("projectReadinessTools.singleZoneCoolingHeatingTool"),
          description: t("projectReadinessTools.singleZoneCoolingHeatingToolDescription"),
          href: "/project-readiness-tools/overheating-tool",
        },
      ],
    },
  ]
  console.log("projectReadinessPageItems===========>", projectReadinessPageItems)
  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" color="text.primary">
        {t("projectReadinessTools.pageHeading")}
      </Heading>
      <Text pt="4" fontSize="lg" color="text.primary">
        {t("projectReadinessTools.pageDescription")}
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
