import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
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
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { RouterLink } from "../../shared/navigation/router-link"

export const NavBar = observer(() => {
  const { t } = useTranslation()

  return (
    <Box w="full" h={16} position="sticky" top={0} bg="greys.white" zIndex={10}>
      <Container maxW="container.lg">
        <Flex align="center">
          <RouterLink to="/">
            <Image alt={t("site.linkHome")} src="images/logo.svg" />
          </RouterLink>
          <Show above="md">
            <Text fontSize="2xl">{t("site.navBarTitle")}</Text>
            <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
              {t("site.beta")}
            </Text>
          </Show>
          <Spacer />
          <HStack gap={2}>
            <NavBarSearch />
            <NavBarMenu />
          </HStack>
        </Flex>
      </Container>
    </Box>
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

const NavBarMenu = observer(() => {
  const { t } = useTranslation()
  const { sessionStore } = useMst()
  const navigate = useNavigate()

  const { logout, loggedIn } = sessionStore
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        borderRadius="lg"
        border="solid black"
        borderWidth="1px"
        p={3}
        variant="primaryInverse"
        icon={<FontAwesomeIcon style={{ height: "14px", width: "14px" }} icon={faBars} />}
      />
      <MenuList>
        {loggedIn ? (
          <MenuItem as={Button} variant="tertiary" onClick={logout}>
            {t("auth.logout")}
          </MenuItem>
        ) : (
          <MenuItem
            as={Button}
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
