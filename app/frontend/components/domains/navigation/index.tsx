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
import { JurisdictionIndexScreen } from "../jurisdictions/index"
import { JurisdictionConfigurationScreen } from "../jurisdictions/jurisdiction-configuration-screen"
import { JurisdictionScreen } from "../jurisdictions/jurisdiction-screen"
import { JurisdictionSubmissionInboxScreen } from "../jurisdictions/jurisdiction-submisson-inbox-screen"
import { NewJurisdictionScreen } from "../jurisdictions/new-jurisdiction-screen"
import { JurisdictionSubmissionInboxScreen } from "../jurisdictions/submission-inbox/jurisdiction-submisson-inbox-screen"
import { JurisdictionUserIndexScreen } from "../jurisdictions/users"
import { LandingScreen } from "../landing"
import { ContactScreen } from "../misc/contact-screen"
import { PermitApplicationIndexScreen } from "../permit-application"
import { NewPermitApplicationScreen } from "../permit-application/new-permit-application-screen"
import { PermitApplicationScreen } from "../permit-application/permit-application-screen"
import { RequirementTemplatesScreen } from "../requirement-template"
import { EditRequirementTemplateScreen } from "../requirement-template/edit-requirement-template-screen"
import { NewRequirementTemplateScreen } from "../requirement-template/new-requirement-tempate-screen"
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
      <Route path="/requirement-templates" element={<RequirementTemplatesScreen />} />
      <Route path="/requirement-templates/new" element={<NewRequirementTemplateScreen />} />
      <Route path="/requirement-templates/:requirementTemplateId/edit" element={<EditRequirementTemplateScreen />} />
    </>
  )

  const adminOrManagerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/users" element={<JurisdictionUserIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/users/invite" element={<InviteScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/configuration" element={<JurisdictionConfigurationScreen />} />
    </>
  )

  const managerOrReviewerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/submission-inbox" element={<JurisdictionSubmissionInboxScreen />} />
    </>
  )

  const submitterOnlyRoutes = <></>
  return (
    <Routes location={location}>
      {loggedIn ? (
        <>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
          <Route path="/permit-applications/new" element={<NewPermitApplicationScreen />} />
          <Route path="/permit-applications/:id" element={<PermitApplicationScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />

          {(currentUser?.isReviewManager || currentUser?.isReviewer) && managerOrReviewerRoutes}
          {currentUser?.isSuperAdmin && superAdminOnlyRoutes}
          {(currentUser?.isSuperAdmin || currentUser?.isReviewManager) && adminOrManagerRoutes}
          {currentUser?.isSubmitter && submitterOnlyRoutes}
        </>
      ) : (
        <>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
          <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
        </>
      )}
      <Route path="/contact" element={<ContactScreen />} />
    </Routes>
  )
})
