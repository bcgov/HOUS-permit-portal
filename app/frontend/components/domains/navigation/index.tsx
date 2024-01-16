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
import { NewJurisdictionScreen } from "../jurisdictions/new-jurisdiction-screen"
import { LandingScreen } from "../landing"
import { PermitApplicationIndexScreen } from "../permit-application"
import { RequirementsLibraryScreen } from "../requirements-library"
import { AcceptInvitationScreen } from "../users/accept-invitation-screen"
import { InviteScreen } from "../users/invite-screen"
import { ProfileScreen } from "../users/profile-screen"
import { NavBar } from "./nav-bar"

export const Navigation = observer(() => {
  const { sessionStore } = useMst()

  const { validateToken, isValidating } = sessionStore

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

const AppRoutes = observer(() => {
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore
  const location = useLocation()

  const { userStore } = useMst()
  const { currentUser } = userStore

  const superAdminOnlyRoutes = (
    <>
      <Route path="/jurisdictions" element={<JurisdictionIndexScreen />} />
      <Route path="/jurisdictions/new" element={<NewJurisdictionScreen />} />
      <Route path="/requirements-library" element={<RequirementsLibraryScreen />} />
    </>
  )

  const adminOrManagerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionUserIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/invite" element={<InviteScreen />} />
    </>
  )

  const submitterOnlyRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
    </>
  )

  return (
    <Routes location={location}>
      {loggedIn ? (
        <>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />

          {currentUser?.isSuperAdmin && superAdminOnlyRoutes}
          {(currentUser?.isSuperAdmin || currentUser?.isReviewManager) && adminOrManagerRoutes}
          {currentUser?.isSubmitter && submitterOnlyRoutes}
        </>
      ) : (
        <>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
        </>
      )}
    </Routes>
  )
})
