import { Box, Container, Divider, Flex, Heading, Image, Link, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { RouterLink } from "../navigation/router-link"

export const Footer = observer(() => {
  const location = useLocation()
  const {
    userStore,
    sessionStore: { loggedIn },
  } = useMst()
  const { currentUser } = userStore
  const { t } = useTranslation()
  const onlyShowFooterOnRoutes = [
    "/reset-password",
    "/accept-invitation",
    "/login",
    "/forgot-password",
    "/register",
    "/permit-applications",
    "/welcome",
  ]

  const shouldShowFooter = onlyShowFooterOnRoutes.some((route) => location.pathname.startsWith(route))

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
          <Box py={14} bg="greys.grey03" w="full">
            <Container maxW="container.lg">
              <Flex direction="column" gap={8}>
                <Flex direction={{ base: "column", md: "row" }} gap={12}>
                  <Box flex={1}>
                    <Image alt="site logo" src={"/images/logo.svg"} width="200px" />
                  </Box>
                  <Flex direction="column" gap={4} flex={3} pt={4}>
                    <Heading as="h3" size="md">
                      {t("site.titleLong")}
                    </Heading>
                    <Flex direction={{ base: "column", md: "row" }} flex={1} gap={{ base: 8, md: 0 }}>
                      <Flex direction="column" gap={4} w={{ base: "100%", md: "33%" }}>
                        <RouterLink to="/" color="text.primary">
                          {t("site.home")}
                        </RouterLink>
                        <RouterLink to="/contact" color="text.primary">
                          {t("site.contact")}
                        </RouterLink>
                        <Link
                          href={
                            "https://www2.gov.bc.ca/gov/content/housing-tenancy/building-or-renovating/permits/building-permit-hub"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          color="text.primary"
                        >
                          {t("site.help")}
                        </Link>
                      </Flex>

                      <Flex direction="column" gap={4} w={{ base: "100%", md: "33%" }}>
                        {!loggedIn ? (
                          <>
                            <RouterLink to="/login" color="text.primary">
                              {t("auth.login")}
                            </RouterLink>
                            <RouterLink to="/register" color="text.primary">
                              {t("auth.register")}
                            </RouterLink>
                          </>
                        ) : (
                          <></>
                        )}
                      </Flex>
                      <Flex direction="column" gap={4} w={{ base: "100%", md: "33%" }}>
                        <Link
                          href="https://www2.gov.bc.ca/gov/content/about-gov-bc-ca"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="text.primary"
                        >
                          {t("site.aboutTitle")}
                        </Link>
                        <Link
                          href="https://www2.gov.bc.ca/gov/content/home/disclaimer"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="text.primary"
                        >
                          {t("site.disclaimerTitle")}
                        </Link>
                        <Link
                          href="https://www2.gov.bc.ca/gov/content/home/accessible-government"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="text.primary"
                        >
                          {t("site.accessibility")}
                        </Link>
                        <Link
                          href="https://www2.gov.bc.ca/gov/content/home/copyright"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="text.primary"
                        >
                          {t("site.copyright")}
                        </Link>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Divider borderColor="theme.blue" />
                <Link
                  href="https://www2.gov.bc.ca/gov/content/home/copyright"
                  color="text.secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                  textDecoration="none"
                  fontSize="sm"
                >
                  © {new Date().getFullYear()} {t("site.copyrightHolder")}
                </Link>
              </Flex>
            </Container>
          </Box>
        </Flex>
      )}
    </>
  )
})
