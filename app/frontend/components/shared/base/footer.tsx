import { Box, Button, Container, Divider, Flex, HStack, Heading, Image, Link, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { RouterLink } from "../navigation/router-link"

export const Footer = observer(() => {
  const location = useLocation()
  const { userStore, sessionStore } = useMst()
  const { currentUser } = userStore
  const { t } = useTranslation()
  const excludeFooterRoutes = ["/reset-password", "/accept-invitation", "/login", "/forgot-password", "/register"]

  const shouldShowFooter =
    (!sessionStore.loggedIn && !excludeFooterRoutes.includes(location.pathname)) ||
    currentUser?.role === EUserRoles.submitter

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
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="center"
            gap={4}
            p={4}
            align="center"
            bg="greys.grey04"
          >
            <Text>{t("site.didYouFind")}</Text>
            <HStack gap={3}>
              <Button variant="secondary">{t("ui.yes")}</Button>
              <Button variant="secondary">{t("ui.no")}</Button>
            </HStack>
          </Flex>
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
                    <Image alt="site logo" src={"/images/logo.svg"} />
                  </Box>
                  <Flex direction="column" gap={4} flex={3}>
                    <Heading size="md">{t("site.titleLong")}</Heading>
                    <Flex direction={{ base: "column", md: "row" }} flex={1} gap={{ base: 8, md: 0 }}>
                      <Flex direction="column" gap={4} w={{ base: "100%", md: "33%" }}>
                        <RouterLink to="/" color="text.primary">
                          {t("site.home")}
                        </RouterLink>
                        <RouterLink to="/contact" color="text.primary">
                          {t("site.contact")}
                        </RouterLink>
                        <Link
                          href="https://www2.gov.bc.ca/gov/content/home/accessible-government"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="text.primary"
                        >
                          {t("site.help")}
                        </Link>
                      </Flex>
                      <Flex direction="column" gap={4} w={{ base: "100%", md: "33%" }}>
                        <RouterLink to="/login" color="text.primary">
                          {t("auth.login")}
                        </RouterLink>
                        <RouterLink to="/register" color="text.primary">
                          {t("auth.register")}
                        </RouterLink>
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
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Divider border="1px solid" borderColor="theme.blue" />
                <Link
                  href="https://www2.gov.bc.ca/gov/content/home/disclaimer"
                  color="text.secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text fontSize="sm">
                    © ${new Date().getFullYear()} {t("site.copyrightHolder")}
                  </Text>
                </Link>
              </Flex>
            </Container>
          </Box>
        </Flex>
      )}
    </>
  )
})
