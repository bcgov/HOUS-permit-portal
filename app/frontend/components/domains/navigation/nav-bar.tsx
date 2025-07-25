import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemProps,
  MenuList,
  Portal,
  Show,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Envelope, Folders, List, Warning } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { PopoverProvider, useNotificationPopover } from "../../../hooks/use-notification-popover"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { INotification, IPermitNotificationObjectData } from "../../../types/types"
import { HelpDrawer } from "../../shared/help-drawer"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import SandboxHeader from "../../shared/sandbox/sandbox-header"
import { NotificationsPopover } from "../home/notifications/notifications-popover"
import { RegionalRMJurisdictionSelect } from "./regional-rm-jurisdiction-select"
import { SandboxMenuItem } from "./sandbox-menu-item"
import { SubNavBar } from "./sub-nav-bar"

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

// TODO: refactor these into a single function that takes a regex
function isStepCodePath(path: string): boolean {
  const regex = /^\/part-(3|9)-step-code.*$/
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
    isStepCodePath,
  ]

  return matchers.some((matcher) => matcher(path))
}

export const NavBar = observer(function NavBar() {
  const { t } = useTranslation()
  const { sessionStore, userStore, notificationStore, uiStore, sandboxStore } = useMst()

  const { currentUser } = userStore
  const { loggedIn } = sessionStore
  const { criticalNotifications } = notificationStore
  const { rmJurisdictionSelectKey } = uiStore

  const location = useLocation()
  const path = location.pathname

  return (
    <PopoverProvider>
      <Box
        as="nav"
        id="mainNav"
        w="full"
        bg={currentUser?.isSubmitter || !loggedIn ? "greys.white" : "theme.blue"}
        color={currentUser?.isSubmitter || !loggedIn ? "theme.blue" : "greys.white"}
        zIndex={10}
        borderBottomWidth={2}
        borderColor="border.light"
        shadow="elevations.elevation01"
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
            <Show above="md">
              <Flex direction="column" w="full">
                <HStack>
                  <Text fontSize="2xl" fontWeight="normal" mb="0" whiteSpace="nowrap">
                    {currentUser?.isSuperAdmin ? t("site.adminNavBarTitle") : t("site.title")}
                  </Text>

                  <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                    {t("site.beta")}
                  </Text>
                </HStack>
                {currentUser?.isReviewStaff && (
                  <SandboxHeader
                    justify="center"
                    align="center"
                    position="static"
                    borderTopRadius={0}
                    mb={-2}
                    color="text.primary"
                    expanded
                  />
                )}
              </Flex>
              <Spacer />
            </Show>
            <HStack gap={3} w="full" justify="flex-end">
              {!loggedIn && <HelpDrawer />}
              {currentUser?.isSubmitter && !currentUser.isUnconfirmed && (
                <RouterLinkButton to="/" variant="tertiary" leftIcon={<Folders size={16} />}>
                  {t("site.myPermits")}
                </RouterLinkButton>
              )}
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
                  <Text color="whiteAlpha.700" textAlign="right" variant="tiny_uppercase">
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
              <NavBarMenu />
            </HStack>
          </Flex>
        </Container>
      </Box>
      {!R.isEmpty(criticalNotifications) && <ActionRequiredBox notification={criticalNotifications[0]} />}

      {!shouldHideSubNavbarForPath(path) && <SubNavBar />}
    </PopoverProvider>
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

interface INavBarMenuProps {}

const NavBarMenu = observer(function NavBarMenu({}: INavBarMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sessionStore, userStore } = useMst()
  const { currentUser } = userStore
  const { logout, loggedIn } = sessionStore
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleClickLogout = async () => {
    await logout()
  }

  const superAdminOnlyItems = (
    <MenuGroup>
      <NavMenuItem label={t("home.permitTemplateCatalogueTitle")} to={"/requirement-templates"} />
      <NavMenuItem label={t("home.requirementsLibraryTitle")} to={"/requirements-library"} />
      <NavMenuItem label={t("home.configurationManagement.title")} to={"/configuration-management"} />
      <NavMenuItem label={t("home.earlyAccess.title")} to={"/early-access"} />
      <MenuDivider my={0} borderColor="border.light" />
    </MenuGroup>
  )

  const reviewStaffOnlyItems = (
    <MenuGroup>
      <SandboxMenuItem />
      <MenuDivider my={0} borderColor="border.light" />
    </MenuGroup>
  )

  const reviewManagerOnlyItems = (
    <MenuGroup>
      <NavMenuItem
        label={t("site.breadcrumb.submissionInbox")}
        to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/submission-inbox`}
      />
      <NavMenuItem label={t("site.breadcrumb.digitalBuildingPermits")} to={"/digital-building-permits"} />
      <NavMenuItem
        label={t("site.breadcrumb.configurationManagement")}
        to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/configuration-management`}
      />
      <NavMenuItem
        label={t("site.breadcrumb.apiSettings")}
        to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/api-settings`}
      />
      <MenuDivider my={0} borderColor="border.light" />
    </MenuGroup>
  )

  const adminOrManagerItems = <></>

  const reviwerOnlyItems = (
    <MenuGroup>
      <NavMenuItem
        label={t("site.breadcrumb.submissionInbox")}
        to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/submission-inbox`}
      />
      <MenuDivider my={0} borderColor="border.light" />
    </MenuGroup>
  )

  const submitterOnlyItems = <></>

  return (
    <Menu onClose={() => setIsMenuOpen(false)} onOpen={() => setIsMenuOpen(true)} computePositionOnMount>
      <Show below="md">
        <MenuButton
          as={IconButton}
          borderRadius="lg"
          border={currentUser?.isSubmitter || !loggedIn ? "solid black" : "solid white"}
          borderWidth="1px"
          p={3}
          variant={currentUser?.isSubmitter || !loggedIn ? "primaryInverse" : "primary"}
          aria-label="menu dropdown button"
          icon={<List size={16} weight="bold" />}
        />
      </Show>

      <Show above="md">
        <MenuButton
          as={Button}
          borderRadius="lg"
          border={currentUser?.isSubmitter || !loggedIn ? "solid black" : "solid white"}
          borderWidth="1px"
          p={3}
          variant={currentUser?.isSubmitter || !loggedIn ? "primaryInverse" : "primary"}
          aria-label="menu dropdown button"
          leftIcon={<List size={16} weight="bold" />}
        >
          {t("site.menu")}
        </MenuButton>
      </Show>

      <Portal>
        <Box color="text.primary" className={isMenuOpen && "show-menu-overlay-background"}>
          <MenuList zIndex={99} boxShadow="2xl" pb={0}>
            {loggedIn && !currentUser.isUnconfirmed ? (
              <>
                <Text fontSize="xs" fontStyle="italic" px={3} mb={-1} color="greys.grey01">
                  {t("site.loggedInWelcome")}
                </Text>
                <MenuGroup title={currentUser.name} noOfLines={1}>
                  <MenuDivider my={0} borderColor="border.light" />
                  <NavMenuItem label={t("site.home")} to={"/"} />
                  <MenuDivider my={0} borderColor="border.light" />
                  {!currentUser.isReviewStaff && (
                    <NavMenuItem label={t("home.jurisdictionsTitle")} to={"/jurisdictions"} />
                  )}
                  {currentUser?.isSuperAdmin && superAdminOnlyItems}
                  {(currentUser?.isReviewManager || currentUser?.isRegionalReviewManager) && reviewManagerOnlyItems}
                  {(currentUser?.isSuperAdmin ||
                    currentUser?.isReviewManager ||
                    currentUser?.isRegionalReviewManager) &&
                    adminOrManagerItems}
                  {currentUser?.isReviewer && reviwerOnlyItems}
                  {currentUser?.isSubmitter && submitterOnlyItems}
                  {currentUser?.isReviewStaff && reviewStaffOnlyItems}
                  {currentUser?.isTechnicalSupport && reviewStaffOnlyItems}
                  {!currentUser?.isSubmitter && (
                    <>
                      <MenuItem bg="greys.grey03" onClick={(e) => navigate("/permit-applications/new")}>
                        <Button as={Box} variant="primary">
                          {t("site.newApplication")}
                        </Button>
                      </MenuItem>
                      <NavMenuItem label={t("site.myPermits")} to="/permit-applications" bg="greys.grey03" />
                      <NavMenuItem label={t("site.myProjects")} to="/permit-projects" bg="greys.grey03" />
                      <MenuDivider my={0} borderColor="border.light" />
                    </>
                  )}
                  <HelpDrawer
                    renderTriggerButton={({ onClick }) => <NavMenuItem label={t("ui.help")} onClick={onClick} />}
                  />
                  <NavMenuItem label={t("user.myProfile")} to={"/profile"} />
                  <NavMenuItem label={t("auth.logout")} onClick={handleClickLogout} />
                  <NavMenuItem
                    label={t("home.joinTheBuildingPermitHub.title")}
                    to={"/onboarding-checklist-page-for-lg-adopting"}
                  />
                  <NavMenuItem label={t("home.projectReadinessTools.title")} to={"/project-readiness-tools"} />
                </MenuGroup>
              </>
            ) : (
              <>
                {!loggedIn && (
                  <>
                    <MenuList
                      display="flex"
                      flexWrap="wrap"
                      px={2}
                      py={3}
                      gap={2}
                      border="0"
                      boxShadow="none"
                      maxW="300px"
                    >
                      <NavMenuItemCTA label={t("auth.login")} to="/login" />
                    </MenuList>
                    <MenuDivider my={0} borderColor="border.light" />
                  </>
                )}
                <NavMenuItem label={t("site.home")} to="/" />
                <NavMenuItem label={t("home.jurisdictionsTitle")} to={"/jurisdictions"} />
                <NavMenuItem label={t("home.projectReadinessTools.title")} to={"/project-readiness-tools"} />
                <NavMenuItem
                  label={t("home.joinTheBuildingPermitHub.title")}
                  to={"/onboarding-checklist-page-for-lg-adopting"}
                />
                {loggedIn && <NavMenuItem label={t("auth.logout")} onClick={handleClickLogout} />}
              </>
            )}

            <MenuDivider my={0} borderColor="border.light" />
            <MenuItem>
              <Link textDecoration="none" w="full" href={"mailto:" + t("site.contactEmail")} isExternal>
                {t("site.giveFeedback")} <Envelope size={16} style={{ display: "inline", color: "inherit" }} />
              </Link>
            </MenuItem>
            {import.meta.env.VITE_RELEASE_VERSION && (
              <MenuItem maxW={"250px"} bg="greys.grey03" _hover={{ cursor: "auto" }}>
                <Text
                  textAlign="center"
                  w="full"
                  color="greys.grey90"
                  fontWeight={"thin"}
                  fontStyle="italic"
                  fontSize="sm"
                >
                  {import.meta.env.VITE_RELEASE_VERSION}
                </Text>
              </MenuItem>
            )}
          </MenuList>
        </Box>
      </Portal>
    </Menu>
  )
})

// Looks complicated but this is jsut how you make it so that either to or onClick must be given, but not necessarily both
interface INavMenuItemProps extends MenuItemProps {
  label: string
  to?: string
  onClick?: (any) => void
}

const NavMenuItem = ({ label, to, onClick, ...rest }: INavMenuItemProps) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    navigate(to)
    onClick && onClick(e)
  }

  return (
    <MenuItem as={"a"} py={2} px={3} onClick={handleClick} _hover={{ cursor: "pointer", bg: "hover.blue" }} {...rest}>
      <Text textAlign="left" w="full">
        {label}
      </Text>
    </MenuItem>
  )
}

// THIS IS CTA BUTTON VERSION FOR THE NAV MENU
interface INavMenuItemCTAProps {
  label: string
  to?: string
  onClick?: (any) => void
}

const NavMenuItemCTA = ({ label, to, onClick }: INavMenuItemCTAProps) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    navigate(to)
    onClick && onClick(e)
  }

  return (
    <MenuItem
      as={"a"}
      flex={1}
      onClick={handleClick}
      style={{
        color: "var(--chakra-colors-greys-white)",
        background: "var(--chakra-colors-theme-blue)",
        borderRadius: "var(--chakra-radii-sm)",
        width: "auto",
      }}
      display={"flex"}
      justifyContent={"center"}
      _hover={{
        bg: "var(--chakra-colors-theme-blueAlt) !important",
        boxShadow: "none",
      }}
    >
      {label}
    </MenuItem>
  )
}
