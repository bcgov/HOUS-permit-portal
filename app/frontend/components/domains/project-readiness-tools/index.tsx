import { Box, Container, Divider, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import React from "react"
import { useTranslation } from "react-i18next"

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
      items: [],
    },
    {
      sectionTitle: t("home.projectReadinessTools.prepareYourApplication"),
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
      <Heading as="h1" mt="16">
        {t("home.projectReadinessTools.pageHeading")}
      </Heading>
      <Text pt="4" fontSize="lg" color="gray.600">
        {t("home.projectReadinessTools.pageDescription")}
      </Text>

      {projectReadinessPageItems.map((section, sectionIndex) => (
        <Box key={sectionIndex} mt="16">
          <Heading as="h2" size="lg" mb="8">
            {section.sectionTitle}
          </Heading>
          <VStack divider={<Divider borderColor="border.light" />} spacing={0} align="stretch">
            {section.items.map((item, itemIndex) => (
              <Box key={itemIndex} py="6" borderBottom="1px solid" borderTop="1px solid" borderColor="border.light">
                <Flex justify="space-between" align="center" w="full">
                  <Box flex="1" pr="4">
                    <Link href={item.href} color="blue.600" fontWeight="semibold" fontSize="lg">
                      {item.linkText}
                    </Link>
                    <Text mt="2" color="gray.700">
                      {item.description}
                    </Text>
                  </Box>
                  <Link href={item.href} color="blue.600" fontWeight="semibold" fontSize="lg">
                    <ArrowRight size={20} />
                  </Link>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      ))}
    </Container>
  )
}
