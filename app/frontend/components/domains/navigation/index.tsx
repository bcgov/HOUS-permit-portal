import { Box } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { FlashMessage } from "../../shared/base/flash-message"
import { Footer } from "../../shared/base/footer"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { ForgotPasswordScreen } from "../authentication/forgot-password-screen"
import { LoginScreen } from "../authentication/login-screen"
import { RegisterScreen } from "../authentication/register-screen"
import { ResetPasswordScreen } from "../authentication/reset-password-screen"
import { HomeScreen } from "../home"
import { JurisdictionIndexScreen } from "../jurisdictions"
import { JurisdictionScreen } from "../jurisdictions/jurisdiction-screen"
import { JurisdictionUserIndexScreen } from "../jurisdictions/jurisdiction-user-index-screen"
import { LandingScreen } from "../landing"
import { PermitApplicationIndexScreen } from "../permit-application"
import { AcceptInvitationScreen } from "../users/accept-invitation-screen"
import { InviteScreen } from "../users/invite-screen"
import { ProfileScreen } from "../users/profile-screen"
import { NavBar } from "./nav-bar"

export const Navigation = observer(() => {
  const { sessionStore } = useMst()

  const { validateToken, isValidating, loggedIn } = sessionStore

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

      {isValidating ? (
        <LoadingScreen />
      ) : (
        <>
          <AppRoutes />
          <Footer />
        </>
      )}
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
        <>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
          <Route path="/jurisdictions" element={<JurisdictionIndexScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
          <Route path="/jurisdictions/:jurisdictionId/users" element={<JurisdictionUserIndexScreen />} />
          <Route path="/jurisdictions/:jurisdictionId/users/invite" element={<InviteScreen />} />
        </>
      ) : (
        <>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
        </>
      )}
    </Routes>
  )
})
