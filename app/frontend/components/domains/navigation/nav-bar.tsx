import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Spacer,
  Text,
} from "@chakra-ui/react"
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { RouterLink } from "../../shared/navigation/router-link"
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
                {currentUser?.isAdmin ? t("site.adminNavBarTitle") : t("site.navBarTitle")}
              </Heading>
              <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                {t("site.beta")}
              </Text>
            </Show>
            <Spacer />
            <HStack gap={2}>
              {currentUser?.isSubmitter && <NavBarSearch />}
              {currentUser?.jurisdiction && <Text color="greys.white">{currentUser.jurisdiction.name}</Text>}
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
    <Button
      variant="tertiary"
      rightIcon={<FontAwesomeIcon style={{ height: "14px", width: "14px" }} icon={faSearch} />}
    >
      {t("ui.search")}
    </Button>
  )
}

interface INavBarMenuProps {
  isAdmin: boolean
}

const NavBarMenu = observer(({ isAdmin }: INavBarMenuProps) => {
  const { t } = useTranslation()
  const { sessionStore } = useMst()
  const navigate = useNavigate()

  const { logout, loggedIn } = sessionStore

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        borderRadius="lg"
        border={isAdmin ? "solid white" : "solid black"}
        borderWidth="1px"
        p={3}
        variant={isAdmin ? "primary" : "primaryInverse"}
        aria-label="menu dropdown button"
        icon={<FontAwesomeIcon style={{ height: "14px", width: "14px" }} icon={faBars} />}
      />
      <MenuList>
        {loggedIn ? (
          <>
            <MenuItem
              as={Button}
              color="text.link"
              variant="tertiary"
              onClick={() => {
                navigate("/profile")
              }}
            >
              {t("user.myProfile")}
            </MenuItem>
            <MenuItem as={Button} color="text.link" variant="tertiary" onClick={logout}>
              {t("auth.logout")}
            </MenuItem>
          </>
        ) : (
          <MenuItem
            as={Button}
            color="text.link"
            variant="tertiary"
            onClick={() => {
              navigate("/login")
            }}
          >
            {t("auth.login")}
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
})
