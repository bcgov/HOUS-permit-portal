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
  MenuList,
  Portal,
  Show,
  Spacer,
  Text,
} from "@chakra-ui/react"
import { Envelope, Folders, List, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { HelpDrawer } from "../../shared/help-drawer"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { StepCodeNavLinks } from "../step-code/nav-links"
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
        position="sticky"
        top={0}
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
              {isStepCode ? (
                <Text fontSize="md" color="text.primary" fontWeight="bold">
                  {t("stepCode.title")}
                </Text>
              ) : (
                <Text fontSize="2xl" fontWeight="normal" mb="0">
                  {currentUser?.isAdmin ? t("site.adminNavBarTitle") : t("site.title")}
                </Text>
              )}
              <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                {t("site.beta")}
              </Text>
            </Show>
            <Spacer />
            <HStack gap={3}>
              {!isStepCode && !loggedIn && <HelpDrawer />}
              {(!isStepCode && currentUser?.isSubmitter) || (!loggedIn && <NavBarSearch />)}
              {currentUser?.isSubmitter ? (
                <RouterLinkButton to="/" variant="tertiary" leftIcon={<Folders size={16} />}>
                  {t("site.myPermits")}
                </RouterLinkButton>
              ) : null}
              {currentUser?.jurisdiction && (
                <Flex direction="column">
                  <Text color="greys.white">{currentUser.jurisdiction.name}</Text>
                  <Text color="whiteAlpha.700" textAlign="right" variant="tiny_uppercase">
                    {t(`user.roles.${currentUser.role as EUserRoles}`)}
                  </Text>
                </Flex>
              )}
              {currentUser?.isReviewer ||
                currentUser?.isReviewManager ||
                (currentUser?.isSuperAdmin && (
                  <Text color="greys.white" textTransform="capitalize">
                    {t(`user.roles.${currentUser.role as EUserRoles}`)}
                  </Text>
                ))}
              {!isStepCode && <NavBarMenu isAdmin={currentUser?.isAdmin} />}
              {isStepCode && <StepCodeNavLinks />}
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

interface INavBarMenuProps {
  isAdmin: boolean
}

const NavBarMenu = observer(({ isAdmin }: INavBarMenuProps) => {
  const { t } = useTranslation()
  const { sessionStore, userStore } = useMst()
  const { currentUser } = userStore
  const { logout, loggedIn } = sessionStore

  const handleClickLogout = async () => {
    await logout()
  }

  const superAdminOnlyItems = (
    <>
      <NavMenuItem label={t("home.jurisdictionsTitle")} to={"/jurisdictions"} />
      <NavMenuItem label={t("home.permitTemplateCatalogueTitle")} to={"/requirement-templates"} />
      <NavMenuItem label={t("home.requirementsLibraryTitle")} to={"/requirements-library"} />
      <MenuDivider />
    </>
  )

  const adminOrManagerItems = <></>

  const submitterOnlyItems = <></>

  return (
    <Menu>
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
        <Box className="nav-menu-dropdown-background">
          <MenuList zIndex={10} boxShadow="2xl">
            {loggedIn ? (
              <>
                <Text fontSize="xs" fontStyle="italic" px={3} mb={-1} color="greys.grey01">
                  {t("site.loggedInWelcome")}
                </Text>
                <MenuGroup title={currentUser.firstName + " " + currentUser.lastName} noOfLines={1}>
                  <MenuDivider />
                  {currentUser?.isSuperAdmin && superAdminOnlyItems}
                  {(currentUser?.isSuperAdmin || currentUser?.isReviewManager) && adminOrManagerItems}
                  {currentUser?.isSubmitter && submitterOnlyItems}
                  <HelpDrawer
                    renderTriggerButton={({ onClick }) => <NavMenuItem label={t("ui.help")} onClick={onClick} />}
                  />
                  <NavMenuItem label={t("user.myProfile")} to={"/profile"} />
                  <NavMenuItem label={t("auth.logout")} onClick={handleClickLogout} />
                </MenuGroup>
              </>
            ) : (
              <>
                <MenuList display="flex" flexWrap="wrap" px={2} py={0} gap={2} border="0" boxShadow="none" maxW="300px">
                  <NavMenuItemCTA label={t("auth.login")} to="/login" />
                  <NavMenuItemCTA label={t("auth.register")} to="/register" />
                </MenuList>
                <MenuDivider />
                <NavMenuItem label={t("site.home")} to="/" />
              </>
            )}
            <MenuDivider />
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
interface INavMenuItemProps {
  label: string
  to?: string
  variant?: string
  onClick?: (any) => void
}

const NavMenuItem = ({ label, to, variant, onClick }: INavMenuItemProps) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    navigate(to)
    onClick && onClick(e)
  }

  return (
    <MenuItem as={Button} variant={variant || "tertiary"} onClick={handleClick}>
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
      <Text textAlign="left" w="full">
        {label}
      </Text>
    </MenuItem>
  )
}
