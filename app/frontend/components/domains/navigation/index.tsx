import { Box, Heading, Spacer } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { FlashMessage } from "../../shared/base/flash-message"
import { Footer } from "../../shared/base/footer"
import { BreadcrumbBar } from "../../shared/navigation/breadcrumb-bar"
import { ForgotPasswordScreen } from "../authentication/forgot-password-screen"
import { LoginScreen } from "../authentication/login-screen"
import { RegisterScreen } from "../authentication/register-screen"
import { ResetPasswordScreen } from "../authentication/reset-password-screen"
import { LandingScreen } from "../landing"
import { LocalJurisdictionIndexScreen } from "../local-jurisdictions"
import { LocalJurisdictionScreen } from "../local-jurisdictions/local-jurisdiction-screen"
import { PermitApplicationIndexScreen } from "../permit-application"
import { NavBar } from "./nav-bar"

export const Navigation = observer(() => {
  const {
    sessionStore: { validateToken },
  } = useMst()

  useEffect(() => {
    validateToken()
  }, [])

  return (
    <BrowserRouter>
      <Box pos="relative" w="full">
        <Box pos="absolute" top={0} zIndex="toast" w="full">
          <FlashMessage />
        </Box>
      </Box>

      <NavBar />
      <BreadcrumbBar />
      <AppRoutes />
      <Spacer />
      <Footer />
    </BrowserRouter>
  )
})

interface IAppRoutesProps {}

const AppRoutes = observer(({}: IAppRoutesProps) => {
  const location = useLocation()

  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore

  return (
    <Routes location={location}>
      {loggedIn ? (
        <Route path="/" element={<Heading>Housing Permit Portal!</Heading>} />
      ) : (
        <>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
          <Route path="/local-jurisdictions" element={<LocalJurisdictionIndexScreen />} />
          <Route path="/local-jurisdictions/:localJurisdictionId" element={<LocalJurisdictionScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
        </>
      )}
    </Routes>
  )
})
