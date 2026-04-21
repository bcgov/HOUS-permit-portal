import { Box, Container, Divider, Flex, Heading, Image, Link, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { matchPath, useLocation } from "react-router-dom"
import { RouterLink } from "../navigation/router-link"

export const Footer = observer(() => {
  const location = useLocation()
  const { t } = useTranslation()
  const onlyShowFooterOnRoutes = [
    "/reset-password",
    "/accept-invitation",
    "/login",
    "/forgot-password",
    "/welcome",
    "/contact",
    "/project-readiness-tools/*",
    "/jurisdictions/:slug/step-code-requirements",
    "/letter-of-assurance",
    "/privacy-policy",
    "/onboarding-checklist-page-for-lg-adopting",
  ]

  const shouldShowFooter = onlyShowFooterOnRoutes.some((route) => matchPath(route, location.pathname))

  return (
    <>
      {shouldShowFooter && (
        <Flex
          direction="column"
          as="footer"
          w="full"
          justifySelf="flex-end"
          borderTop="2px solid"
          borderColor="border.light"
          zIndex={10}
        >
          <Flex py={8} borderY="4px solid" borderColor="theme.yellow" bg="text.primary" color="greys.white">
            <Container maxW="container.lg">
              <Text>{t("site.territorialAcknowledgement")}</Text>
            </Container>
          </Flex>
          <Box py={14} bg="white" w="full">
            <Container maxW="container.lg">
              <Flex direction="column" gap={8}>
                <Flex direction={{ base: "column", md: "row" }} gap={{ base: 8, md: 0 }}>
                  <Box flex={1} pr={{ md: 12 }}>
                    <Image alt="site logo" src={"/images/logo.svg"} width="200px" />
                    <Text mt={6} fontSize="sm" color="text.secondary">
                      {t("site.multiLanguageAccessibility")}{" "}
                      <Link
                        href="https://www2.gov.bc.ca/gov/content/home/get-help-with-government-services"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="text.primary"
                      >
                        {t("site.callEmailOrTextUs")}
                      </Link>
                      {", "}
                      {t("ui.or")}{" "}
                      <Link
                        href="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="text.primary"
                      >
                        {t("site.findAServiceCentre")}
                      </Link>
                    </Text>
                  </Box>
                  <VStack align="flex-start" gap={4} flex={1} pt={{ base: 0, md: 4 }} mr={16}>
                    <Heading as="h3" size="md" pb={2} borderBottom="1px solid" borderColor="text.primary" w="full">
                      {t("site.titleLong")}
                    </Heading>
                    <RouterLink to="/" color="text.primary">
                      {t("site.home")}
                    </RouterLink>
                    <Link
                      href="https://www2.gov.bc.ca/gov/content/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="text.primary"
                    >
                      {t("site.aboutGovBcCa")}
                    </Link>
                    <RouterLink to="/contact" color="text.primary">
                      {t("site.contact")}
                    </RouterLink>
                    <Link
                      href="https://www2.gov.bc.ca/gov/content?id=F2AE1595C6044E819A316925F0A74E09"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="text.primary"
                    >
                      {t("site.help")}
                    </Link>
                  </VStack>
                  <VStack align="flex-start" gap={4} flex={1} pt={{ base: 0, md: 4 }}>
                    <Heading as="h3" size="md" pb={2} borderBottom="1px solid" borderColor="text.primary" w="full">
                      {t("site.moreInfo")}
                    </Heading>
                    <Link
                      href="https://www2.gov.bc.ca/gov/content/home/accessible-government"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="text.primary"
                    >
                      {t("site.accessibility")}
                    </Link>
                    <RouterLink to="/privacy-policy" color="text.primary">
                      {t("site.privacyPolicy")}
                    </RouterLink>
                    <Link
                      href="https://www2.gov.bc.ca/gov/content/home/disclaimer"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="text.primary"
                    >
                      {t("site.disclaimerTitle")}
                    </Link>
                    <Link
                      href="https://www2.gov.bc.ca/gov/content/home/copyright"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="text.primary"
                    >
                      {t("site.copyright")}
                    </Link>
                  </VStack>
                </Flex>
                <Divider borderColor="theme.blue" />
                <Text color="text.secondary" fontSize="sm">
                  &copy; {new Date().getFullYear()} {t("site.copyrightHolder")}
                </Text>
              </Flex>
            </Container>
          </Box>
        </Flex>
      )}
    </>
  )
})
