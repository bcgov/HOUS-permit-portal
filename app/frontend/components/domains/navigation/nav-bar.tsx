import { Box } from "@chakra-ui/react"
import React from "react"

// Used in CSS calculations involving 100vh for vertical centering
export const NAVBAR_HEIGHT = "64px"

export const NavBar = () => {
  return (
    <Box w="full" h={NAVBAR_HEIGHT}>
      NAVBAR
    </Box>
  )
}
