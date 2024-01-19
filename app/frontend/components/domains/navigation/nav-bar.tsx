import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Heading,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Spacer,
  Text,
} from "@chakra-ui/react"
import { List, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { SubNavBar } from "./sub-nav-bar"

export const NavBar = observer(() => {
  const { t } = useTranslation()
  const { sessionStore, userStore } = useMst()

  const { currentUser } = userStore

  const { loggedIn } = sessionStore

  const location = useLocation()
  const path = location.pathname

  return (
    <>
      <Box
        as="nav"
        w="full"
        position="sticky"
        top={0}
        bg={currentUser?.isAdmin ? "theme.blue" : "greys.white"}
        color={currentUser?.isAdmin ? "greys.white" : "theme.blue"}
        zIndex={10}
        shadow="md"
      >
        <Container maxW="container.lg">
          <Flex align="center" gap={2}>
            <RouterLink to="/">
              <Image
                alt={t("site.linkHome")}
                src={currentUser?.isAdmin ? "/images/logo-light.svg" : "/images/logo.svg"}
              />
            </RouterLink>
            <Show above="md">
              <Heading fontSize="2xl" fontWeight="normal">
                {currentUser?.isAdmin ? t("site.adminNavBarTitle") : t("site.title")}
              </Heading>
              <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                {t("site.beta")}
              </Text>
            </Show>
            <Spacer />
            <HStack gap={3}>
              {currentUser?.isSubmitter && <NavBarSearch />}
              {currentUser?.jurisdiction && <Text color="greys.white">{currentUser.jurisdiction.name}</Text>}
              {currentUser?.isReviewer ||
                currentUser?.isReviewManager ||
                (currentUser?.isSuperAdmin && (
                  <Text color="greys.white" textTransform="capitalize">
                    {t(`user.roles.${currentUser.role as EUserRoles}`)}
                  </Text>
                ))}
              <NavBarMenu isAdmin={currentUser?.isAdmin} />
            </HStack>
          </Flex>
        </Container>
      </Box>
      {path !== "/" && loggedIn && <SubNavBar />}
    </>
  )
})

const NavBarSearch = () => {
  const { t } = useTranslation()

  return (
    <Button variant="tertiary" rightIcon={<MagnifyingGlass size={16} />}>
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

  const superAdminOnlyItems = (
    <>
      <NavMenuItem label={t("home.jurisdictionsTitle")} to={"/jurisdictions"} />
      <NavMenuItem label={t("home.permitTemplateCatalogueTitle")} to={"/templates-catalogue"} />
      <NavMenuItem label={t("home.requirementsLibraryTitle")} to={"/requirements-library"} />
      <NavMenuItem label={t("home.auditLogTitle")} to={"/audit-log"} />
    </>
  )

  const adminOrManagerItems = <></>

  const submitterOnlyItems = <></>

  return (
    <Menu>
      <MenuButton
        as={Button}
        borderRadius="lg"
        border={isAdmin ? "solid white" : "solid black"}
        borderWidth="1px"
        p={3}
        variant={isAdmin ? "primary" : "primaryInverse"}
        aria-label="menu dropdown button"
        leftIcon={<List size={16} weight="bold" color={isAdmin ? "white" : "black"} />}
      >
        {t("site.menu")}
      </MenuButton>
      <MenuList>
        {loggedIn ? (
          <>
            <NavMenuItem label={t("site.home")} to={"/"} />
            {currentUser?.isSuperAdmin && superAdminOnlyItems}
            {(currentUser?.isSuperAdmin || currentUser?.isReviewManager) && adminOrManagerItems}
            {currentUser?.isSubmitter && submitterOnlyItems}
            <Divider borderWidth="1px" />
            <NavMenuItem label={t("user.myProfile")} to={"/profile"} />
            <NavMenuItem label={t("auth.logout")} onClick={logout} />
          </>
        ) : (
          <NavMenuItem label={t("auth.login")} to="/login" />
        )}
      </MenuList>
    </Menu>
  )
})

// Looks complicated but this is jsut how you make it so that either to or onClick must be given, but not necessarily both
type TNavMenuItemProps = {
  label: string
} & ({ to: string; onClick?: (any) => any } | { onClick: (any) => any; to?: string })

const NavMenuItem = ({ label, to, onClick }: TNavMenuItemProps) => {
  return (
    <MenuItem as={RouterLinkButton} color="text.primary" variant="tertiary" to={to} onClick={onClick}>
      <Text textAlign="left" w="full">
        {label}
      </Text>
    </MenuItem>
  )
}
