import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
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
import { Envelope, Folders, List, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { HelpDrawer } from "../../shared/help-drawer"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { RegionalRMJurisdictionSelect } from "./regional-rm-jurisdiction-select"
import { SubNavBar } from "./sub-nav-bar"

function isTemplateEditPath(path: string): boolean {
  const regex = /^\/requirement-templates\/([a-f\d-]+)\/edit$/

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

function shouldHideSubNavbarForPath(path: string): boolean {
  const matchers: Array<(path: string) => boolean> = [
    (path) => path === "/",
    isTemplateEditPath,
    isTemplateVersionPath,
    isPermitApplicationEditPath,
    isPermitApplicationPath,
    isDigitalPermitEditPath,
  ]

  return matchers.some((matcher) => matcher(path))
}

export const NavBar = observer(() => {
  const { t } = useTranslation()
  const { sessionStore, userStore } = useMst()

  const { currentUser } = userStore

  const { loggedIn } = sessionStore

  const location = useLocation()
  const path = location.pathname

  const isStepCode = R.test(/step-code/, path)

  return (
    <>
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
        <Container maxW="container.lg">
          <Flex align="center" gap={2}>
            <RouterLink to="/welcome">
              <Image
                fit="cover"
                htmlHeight="64px"
                htmlWidth="166px"
                alt={t("site.linkHome")}
                src={currentUser?.isSubmitter || !loggedIn ? "/images/logo.svg" : "/images/logo-light.svg"}
              />
            </RouterLink>
            <Show above="md">
              <Text fontSize="2xl" fontWeight="normal" mb="0">
                {currentUser?.isSuperAdmin ? t("site.adminNavBarTitle") : t("site.title")}
              </Text>

              <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                {t("site.beta")}
              </Text>
            </Show>
            <Spacer />
            <HStack gap={3}>
              {!loggedIn && <HelpDrawer />}
              {/* todo: navbar search? */}
              {/* {currentUser?.isSubmitter && <NavBarSearch />} */}
              {currentUser?.isSubmitter && !currentUser.isUnconfirmed && (
                <RouterLinkButton to="/" variant="tertiary" leftIcon={<Folders size={16} />}>
                  {t("site.myPermits")}
                </RouterLinkButton>
              )}
              {currentUser?.isReviewStaff && !currentUser.isRegionalReviewManager && (
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
                  <RegionalRMJurisdictionSelect />
                </VStack>
              )}
              {currentUser?.isSuperAdmin && (
                <Text color="greys.white" textTransform="capitalize">
                  {t(`user.roles.${currentUser.role as EUserRoles}`)}
                </Text>
              )}
              {(!loggedIn || currentUser?.isSubmitter) && (
                <RouterLinkButton variant="tertiary" to="/jurisdictions">
                  {t("home.jurisdictionsTitle")}
                </RouterLinkButton>
              )}
              <NavBarMenu />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {!shouldHideSubNavbarForPath(path) && loggedIn && <SubNavBar />}
    </>
  )
})

const NavBarSearch = () => {
  const { t } = useTranslation()

  return (
    <Button variant="tertiary" leftIcon={<MagnifyingGlass size={16} />}>
      {t("ui.search")}
    </Button>
  )
}

interface INavBarMenuProps {}

const NavBarMenu = observer(({}: INavBarMenuProps) => {
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
      <NavMenuItem label={t("site.breadcrumb.users")} to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/users`} />
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

      <Portal>
        <Box color="text.primary" className={isMenuOpen && "show-menu-overlay-background"}>
          <MenuList zIndex={99} boxShadow="2xl">
            {loggedIn && !currentUser.isUnconfirmed ? (
              <>
                <Text fontSize="xs" fontStyle="italic" px={3} mb={-1} color="greys.grey01">
                  {t("site.loggedInWelcome")}
                </Text>
                <MenuGroup title={currentUser.name} noOfLines={1}>
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
                  {!currentUser?.isSubmitter && (
                    <>
                      <MenuItem bg="greys.grey03">
                        <Button variant="primary" onClick={(e) => navigate("/permit-applications/new")}>
                          {t("site.newApplication")}
                        </Button>
                      </MenuItem>
                      <NavMenuItem label={t("site.myPermits")} to="/permit-applications" bg="greys.grey03" />
                      <MenuDivider my={0} borderColor="border.light" />
                    </>
                  )}
                  <HelpDrawer
                    renderTriggerButton={({ onClick }) => <NavMenuItem label={t("ui.help")} onClick={onClick} />}
                  />
                  <NavMenuItem label={t("user.myProfile")} to={"/profile"} />
                  <NavMenuItem label={t("auth.logout")} onClick={handleClickLogout} />
                </MenuGroup>
              </>
            ) : (
              <>
                {!loggedIn && (
                  <MenuList
                    display="flex"
                    flexWrap="wrap"
                    px={2}
                    py={0}
                    gap={2}
                    border="0"
                    boxShadow="none"
                    maxW="300px"
                  >
                    <NavMenuItemCTA label={t("auth.login")} to="/login" />
                  </MenuList>
                )}
                <MenuDivider my={0} borderColor="border.light" />
                <NavMenuItem label={t("site.home")} to="/" />
                <NavMenuItem label={t("home.jurisdictionsTitle")} to={"/jurisdictions"} />
                {loggedIn && <NavMenuItem label={t("auth.logout")} onClick={handleClickLogout} />}
              </>
            )}

            <MenuDivider my={0} borderColor="border.light" />
            <MenuItem>
              <Link textDecoration="none" w="full" href={"mailto:" + t("site.contactEmail")} isExternal>
                {t("site.giveFeedback")} <Envelope size={16} style={{ display: "inline", color: "inherit" }} />
              </Link>
            </MenuItem>
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
  variant?: string
  onClick?: (any) => void
}

const NavMenuItem = ({ label, to, variant, onClick, ...rest }: INavMenuItemProps) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    navigate(to)
    onClick && onClick(e)
  }

  return (
    <MenuItem as={Button} variant={variant || "tertiary"} onClick={handleClick} {...rest}>
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
  variant?: string
  onClick?: (any) => void
}

const NavMenuItemCTA = ({ label, to, variant, onClick }: INavMenuItemCTAProps) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    navigate(to)
    onClick && onClick(e)
  }

  return (
    <MenuItem
      as={Button}
      flex={1}
      variant={variant || "primary"}
      size="sm"
      onClick={handleClick}
      style={{
        color: "var(--chakra-colors-greys-white)",
        background: "var(--chakra-colors-theme-blue)",
        borderRadius: "var(--chakra-radii-sm)",
        width: "auto",
      }}
      _hover={{
        bg: "var(--chakra-colors-theme-blueAlt) !important",
        boxShadow: "none",
      }}
    >
      {label}
    </MenuItem>
  )
}
