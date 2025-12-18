import { Box, Container, Flex, HStack, Heading, Image, Link, Show, Spacer, Text, VStack } from "@chakra-ui/react"
import { Buildings, Tray, Warning } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { PopoverProvider, useNotificationPopover } from "../../../hooks/use-notification-popover"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { INotification, IPermitNotificationObjectData } from "../../../types/types"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import SandboxHeader from "../../shared/sandbox/sandbox-header"
import { NotificationsPopover } from "../home/notifications/notifications-popover"
import { NavBarMenu } from "./nav-bar-menu"
import { RegionalRMJurisdictionSelect } from "./regional-rm-jurisdiction-select"
import { SubNavBar } from "./sub-nav-bar"

import { PreCheckNavBar } from "../pre-check/pre-check-nav-bar"
import { StepCodeNavBar } from "../step-code/nav-bar"
import { Part3NavLinks } from "../step-code/nav-bar/part-3-nav-links"
import { Part9NavLinks } from "../step-code/nav-bar/part-9-nav-links"

function isTemplateEditPath(path: string): boolean {
  const regex = /^\/requirement-templates\/([a-f\d-]+)\/edit$/

  return regex.test(path)
}

function isEarlyAccessTemplateEditPath(path: string): boolean {
  const regex = /^\/early-access?\/requirement-templates\/([a-f\d-]+)\/edit$/

  return regex.test(path)
}

function isEarlyAccessTemplateViewPath(path: string): boolean {
  const regex = /^\/early-access\/requirement-templates\/([a-f\d-]+)$/

  return regex.test(path)
}

function isDigitalPermitEditPath(path: string): boolean {
  const regex = /^\/digital-building-permits\/([a-f\d-]+)\/edit$/

  return regex.test(path)
}

function isTemplateVersionPath(path: string): boolean {
  const regex = /^\/template-versions\/([a-f\d-]+)$/
  return regex.test(path)
}

function isPermitApplicationPath(path: string): boolean {
  const regex = /^\/permit-applications\/([a-f\d-]+)/
  return regex.test(path)
}

function isPermitApplicationEditPath(path: string): boolean {
  const regex = /^\/permit-applications\/([a-f\d-]+)\/edit.*$/
  return regex.test(path)
}

function isApiMappingPath(path: string): boolean {
  const regex = /^(\/jurisdictions\/[a-z\d-]+)?\/api-settings\/api-mappings.*$/
  return regex.test(path)
}

function isLoginPath(path: string): boolean {
  const regex = /^\/login.*$/
  return regex.test(path)
}

function isAdminPath(path: string): boolean {
  const regex = /^\/admin.*$/
  return regex.test(path)
}

function isProjectDetailPath(path: string): boolean {
  const regex = /^\/projects\/[a-f\d-]+/
  return regex.test(path)
}

function isStepCodePath(path: string): boolean {
  const regex = /^(\/part-(3|9)-step-code|\/permit-applications\/[a-f\d-]+\/edit\/part-(3|9)-step-code).*$/
  return regex.test(path)
}

function isPreCheckPath(path: string): boolean {
  // TODO: Update for pre checks that are attached to a permit application
  const regex = /^\/pre-checks\/[a-f\d-]+/
  return regex.test(path)
}

function shouldHideSubNavbarForPath(path: string): boolean {
  const matchers: Array<(path: string) => boolean> = [
    (path) => path === "/",
    isTemplateEditPath,
    isEarlyAccessTemplateEditPath,
    isEarlyAccessTemplateViewPath,
    isTemplateVersionPath,
    isPermitApplicationEditPath,
    isPermitApplicationPath,
    isDigitalPermitEditPath,
    isApiMappingPath,
    isLoginPath,
    isProjectDetailPath,
    isStepCodePath,
    isAdminPath,
    isPreCheckPath,
  ]

  return matchers.some((matcher) => matcher(path))
}

function shouldHideFullNavBarForPath(path: string): boolean {
  const matchers: Array<(path: string) => boolean> = []

  return matchers.some((matcher) => matcher(path))
}

export const NavBar = observer(function NavBar() {
  const { t } = useTranslation()
  const location = useLocation()
  const path = location.pathname

  if (isPreCheckPath(path)) {
    return <PreCheckNavBar />
  }

  if (isStepCodePath(path)) {
    if (path.includes("part-9")) {
      return <StepCodeNavBar title={t("stepCode.title")} NavLinks={<Part9NavLinks />} />
    } else {
      return <StepCodeNavBar title={t("stepCode.part3.title")} NavLinks={<Part3NavLinks />} />
    }
  }

  if (shouldHideFullNavBarForPath(path)) {
    return null
  }

  return (
    <PopoverProvider>
      <NavBarContent />
    </PopoverProvider>
  )
})

const NavBarContent = observer(function NavBarContent() {
  const { t } = useTranslation()
  const { sessionStore, userStore, notificationStore, uiStore } = useMst()

  const { currentUser } = userStore
  const { loggedIn } = sessionStore
  const { criticalNotifications } = notificationStore
  const { rmJurisdictionSelectKey } = uiStore

  const location = useLocation()
  const path = location.pathname

  return (
    <>
      <Box
        as="nav"
        id="mainNav"
        w="full"
        maxH="var(--app-navbar-height)"
        bg={currentUser?.isSubmitter || !loggedIn ? "greys.white" : "theme.blue"}
        color={currentUser?.isSubmitter || !loggedIn ? "theme.blue" : "greys.white"}
        zIndex={1500}
        shadow="elevations.elevation01"
        position="relative"
      >
        <Container maxW="container.lg" p={2} px={{ base: 4, md: 8 }}>
          <Flex align="center" gap={2} w="full">
            <RouterLink to="/welcome">
              <Box w={120} mr={2}>
                <Image
                  fit="contain"
                  htmlHeight="64px"
                  htmlWidth="166px"
                  alt={t("site.linkHome")}
                  src={currentUser?.isSubmitter || !loggedIn ? "/images/logo.svg" : "/images/logo-light.svg"}
                />
              </Box>
            </RouterLink>
            <Show above="lg">
              <Flex direction="column" w="full">
                <HStack>
                  <Text fontSize="2xl" fontWeight="normal" mb="0" whiteSpace="nowrap">
                    {t("site.title")}
                  </Text>

                  <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                    {t("site.beta")}
                  </Text>
                </HStack>
              </Flex>
              <Spacer />
            </Show>
            <HStack gap={3} w="full" justify="flex-end">
              {(currentUser?.isReviewStaff || currentUser?.isTechnicalSupport) &&
                !currentUser.isRegionalReviewManager && (
                  <Flex direction="column">
                    <Text color="greys.white">{currentUser.jurisdiction.name}</Text>
                    <Text color="whiteAlpha.700" textAlign="right" variant="tiny_uppercase">
                      {t(`user.roles.${currentUser.role as EUserRoles}`)}
                    </Text>
                  </Flex>
                )}

              {currentUser?.isRegionalReviewManager && (
                <VStack align="flex-end" gap={1}>
                  <Text color="whiteAlpha.700" textAlign="right" variant="tiny_uppercase" whiteSpace="nowrap">
                    {t(`user.roles.${currentUser.role as EUserRoles}`)}
                  </Text>
                  <RegionalRMJurisdictionSelect key={rmJurisdictionSelectKey} />
                </VStack>
              )}
              {currentUser?.isSuperAdmin && (
                <Text color="greys.white" textTransform="capitalize">
                  {t(`user.roles.${currentUser.role as EUserRoles}`)}
                </Text>
              )}
              {(!loggedIn || currentUser?.isSubmitter) && (
                <Show above="md">
                  <RouterLinkButton variant="tertiary" to="/jurisdictions">
                    {t("home.jurisdictionsTitle")}
                  </RouterLinkButton>
                </Show>
              )}
              {loggedIn && (
                <NotificationsPopover
                  aria-label="notifications popover"
                  color={currentUser?.isSubmitter || !loggedIn ? "theme.blue" : "greys.white"}
                />
              )}
              {currentUser?.isReviewStaff && (
                <RouterLinkButton
                  px={2}
                  to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/submission-inbox`}
                  variant="ghost"
                  color="greys.white"
                >
                  <Tray size={24} />
                  <Show above="xl">
                    <Box as="span" ml={2}>
                      {t("home.submissionsInboxTitle")}
                    </Box>
                  </Show>
                </RouterLinkButton>
              )}
              {currentUser?.isSubmitter && !currentUser.isUnconfirmed && (
                <RouterLinkButton px={2} to={`/projects`} variant="ghost">
                  <Buildings size={24} />
                  <Show above="xl">
                    <Box as="span" ml={2}>
                      {t("site.myProjects")}
                    </Box>
                  </Show>
                </RouterLinkButton>
              )}
              <NavBarMenu />
            </HStack>
          </Flex>
        </Container>
      </Box>
      {!R.isEmpty(criticalNotifications) && <ActionRequiredBox notification={criticalNotifications[0]} />}
      {currentUser?.isReviewStaff && (
        <SandboxHeader
          justify="center"
          align="center"
          position="static"
          borderTopRadius={0}
          color="text.primary"
          expanded
        />
      )}
      {!shouldHideSubNavbarForPath(path) && <SubNavBar />}
    </>
  )
})

interface IActionRequiredBoxProps {
  notification: INotification
}

const ActionRequiredBox: React.FC<IActionRequiredBoxProps> = observer(({ notification }) => {
  const { notificationStore } = useMst()
  const { generateSpecificLinkData } = notificationStore
  const { t } = useTranslation()
  const linkData = generateSpecificLinkData(notification)
  const { handleOpen } = useNotificationPopover()

  return (
    <Flex
      direction="column"
      gap={2}
      bg={`semantic.warningLight`}
      borderBottom="1px solid"
      borderColor={`semantic.warning`}
      p={4}
    >
      <Flex align="flex-start" gap={2} whiteSpace={"normal"}>
        <Box color={`semantic.warning`}>{<Warning size={24} aria-label={"warning icon"} />}</Box>
        <Flex direction="column" gap={2}>
          <Heading as="h3" fontSize="md">
            {t("ui.actionRequired")}
          </Heading>
          <Text>
            <Trans
              // @ts-ignore
              i18nKey={`site.actionRequired.${notification.actionType}`}
              number={(notification.objectData as IPermitNotificationObjectData).permitApplicationNumber}
              components={{
                1: (
                  <Link href={linkData[0].href}>
                    {(notification.objectData as IPermitNotificationObjectData).permitApplicationNumber}
                  </Link>
                ),
              }}
            />
          </Text>
          <Link onClick={handleOpen}>{t("site.reviewNotifications")}</Link>
        </Flex>
      </Flex>
    </Flex>
  )
})
