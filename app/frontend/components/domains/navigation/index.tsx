import { Box, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { FlashMessage } from "../../shared/flash-message"

const LoginScreen = React.lazy(() =>
  import("../authentication/login-screen").then((module) => ({ default: module.LoginScreen }))
)

export const Navigation = observer(() => {
  return (
    <BrowserRouter>
      <Box pos="relative" w="full">
        <Box pos="absolute" top={0} zIndex="toast" w="full">
          <FlashMessage />
        </Box>
      </Box>

      <AppRoutes />
    </BrowserRouter>
  )
})

interface IAppRoutesProps {}

const AppRoutes = observer(({}: IAppRoutesProps) => {
  const location = useLocation()

  return (
    <Routes location={location}>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<Heading>Housing Permit Portal!</Heading>} />
    </Routes>
  )
})
