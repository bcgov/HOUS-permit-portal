import { Box, Flex, Spacer } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { FlashMessage } from "../../shared/base/flash-message"
import { Footer } from "../../shared/base/footer"
import { RouterLink } from "../../shared/navigation/router-link"
import { ForgotPasswordScreen } from "../authentication/forgot-password-screen"
import { LoginScreen } from "../authentication/login-screen"
import { RegisterScreen } from "../authentication/register-screen"
import { ResetPasswordScreen } from "../authentication/reset-password-screen"
import { JurisdictionIndexScreen } from "../jurisdictions"
import { JurisdictionScreen } from "../jurisdictions/jurisdiction-screen"
import { JurisdictionUserIndexScreen } from "../jurisdictions/jurisdiction-user-index-screen"
import { LandingScreen } from "../landing"
import { PermitApplicationIndexScreen } from "../permit-application"
import { RequirementsLibraryScreen } from "../requirements-library"
import { AcceptInvitationScreen } from "../users/accept-invitation-screen"
import { InviteScreen } from "../users/invite-screen"
import { NavBar } from "./nav-bar"
import { SubNavBar } from "./sub-nav-bar"

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
      <SubNavBar />
      <Box w={"full"} h={"1px"} minH={"1px"} flexGrow={2}>
        <AppRoutes />
      </Box>
    </BrowserRouter>
  )
})

interface IAppRoutesProps {}

const AppRoutes = observer(({}: IAppRoutesProps) => {
  const location = useLocation()

  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore

  return loggedIn ? <LoggedInRoutes /> : <PublicRoutes />
})

function LoggedInRoutes() {
  const location = useLocation()
  return (
    <Routes location={location}>
      <Route
        path="/"
        element={
          <Flex direction="column">
            <RouterLink to="/jurisdictions">Jurisdictions</RouterLink>
            <RouterLink to="/permit-applications">My Applications</RouterLink>
            <RouterLink to="/requirements-library">Requirements Library</RouterLink>
          </Flex>
        }
      />
      <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
      <Route path="/jurisdictions" element={<JurisdictionIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/users" element={<JurisdictionUserIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/users/invite" element={<InviteScreen />} />
      <Route path={"/requirements-library"} element={<RequirementsLibraryScreen />} />
    </Routes>
  )
}

function PublicRoutes() {
  const location = useLocation()
  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
      </Routes>
      <Spacer flexGrow={0} />
      <Footer />
    </>
  )
}
