import { Box, Button } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { RouterLink } from "../../shared/navigation/router-link"

export const NavBar = observer(() => {
  const { sessionStore } = useMst()

  const { logout, loggedIn } = sessionStore

  return (
    <Box w="full" h={16} position="sticky" top={0}>
      NAVBAR{" "}
      {loggedIn ? (
        <Button variant="primary" onClick={logout}>
          LOGOUT
        </Button>
      ) : (
        <RouterLink to="/login">Login</RouterLink>
      )}
    </Box>
  )
})
