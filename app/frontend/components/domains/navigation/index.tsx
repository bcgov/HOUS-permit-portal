import { Box } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { FlashMessage } from "../../shared/base/flash-message"
import { Footer } from "../../shared/base/footer"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { NotFoundScreen } from "../../shared/base/not-found-screen"
import { RedirectScreen } from "../../shared/base/redirect-screen"
import { EULAModal } from "../../shared/eula-modal"
import { PermitApplicationPDFViewer } from "../../shared/permit-applications/pdf-content/viewer"
import { EmailConfirmedScreen } from "../authentication/email-confirmed-screen"
import { ForgotPasswordScreen } from "../authentication/forgot-password-screen"
import { LoginScreen } from "../authentication/login-screen"
import { RegisterScreen } from "../authentication/register-screen"
import { ResetPasswordScreen } from "../authentication/reset-password-screen"
import { HomeScreen } from "../home"
import { ConfigurationManagementScreen } from "../home/review-manager/configuration-management-screen"
import { EnergyStepRequirementsScreen } from "../home/review-manager/configuration-management-screen/energy-step-requirements-screen"
import { SubmissionsInboxSetupScreen } from "../home/review-manager/configuration-management-screen/submissions-inbox-setup-screen"
import { JurisdictionIndexScreen } from "../jurisdictions/index"
import { JurisdictionScreen } from "../jurisdictions/jurisdiction-screen"
import { NewJurisdictionScreen } from "../jurisdictions/new-jurisdiction-screen"
import { JurisdictionSubmissionInboxScreen } from "../jurisdictions/submission-inbox/jurisdiction-submisson-inbox-screen"
import { JurisdictionUserIndexScreen } from "../jurisdictions/users"
import { LandingScreen } from "../landing"
import { ContactScreen } from "../misc/contact-screen"
import { PermitApplicationIndexScreen } from "../permit-application"
import { EditPermitApplicationScreen } from "../permit-application/edit-permit-application-screen"
import { NewPermitApplicationScreen } from "../permit-application/new-permit-application-screen"
import { ReviewPermitApplicationScreen } from "../permit-application/review-permit-application-screen"
import { SuccessfulSubmissionScreen } from "../permit-application/successful-submission"
import { NewRequirementTemplateScreen } from "../requirement-template/new-requirement-template-screen"
import { EditRequirementTemplateScreen } from "../requirement-template/screens/edit-requirement-template-screen"
import { JurisdictionDigitalPermitScreen } from "../requirement-template/screens/jurisdiction-digital-permit-screen"
import { JurisdictionEditDigitalPermitScreen } from "../requirement-template/screens/jurisdiction-edit-digital-permit-screen"
import { RequirementTemplatesScreen } from "../requirement-template/screens/requirement-template-screen"
import { TemplateVersionScreen } from "../requirement-template/screens/template-version-screen"
import { RequirementsLibraryScreen } from "../requirements-library"
import { StepCodeForm } from "../step-code"
import { AcceptInvitationScreen } from "../users/accept-invitation-screen"
import { InviteScreen } from "../users/invite-screen"
import { ProfileScreen } from "../users/profile-screen"
import { NavBar } from "./nav-bar"

export const Navigation = observer(() => {
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore
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
      <EULAModal />

      <Box id="outerScrollContainer">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <>
            <AppRoutes />

            <Footer />
          </>
        )}
      </Box>
    </BrowserRouter>
  )
})

const AppRoutes = observer(() => {
  const { sessionStore, uiStore } = useMst()
  const { loggedIn, tokenExpired } = sessionStore
  const location = useLocation()
  const background = location.state && location.state.background

  const { userStore } = useMst()
  const { currentUser } = userStore

  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (tokenExpired) {
      sessionStore.resetAuth()
      navigate("/login")
      uiStore.flashMessage.show(EFlashMessageStatus.warning, t("auth.tokenExpired"), null)
    }
  }, [tokenExpired])

  const superAdminOnlyRoutes = (
    <>
      <Route path="/jurisdictions" element={<JurisdictionIndexScreen />} />
      <Route path="/jurisdictions/new" element={<NewJurisdictionScreen />} />
      <Route path="/requirements-library" element={<RequirementsLibraryScreen />} />
      <Route path="/requirement-templates" element={<RequirementTemplatesScreen />} />
      <Route path="/requirement-templates/new" element={<NewRequirementTemplateScreen />} />
      <Route path="/requirement-templates/:requirementTemplateId/edit" element={<EditRequirementTemplateScreen />} />
      <Route path="/template-versions/:templateVersionId" element={<TemplateVersionScreen />} />
    </>
  )

  const adminOrManagerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/users" element={<JurisdictionUserIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/users/invite" element={<InviteScreen />} />
    </>
  )

  const managerOrReviewerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/submission-inbox" element={<JurisdictionSubmissionInboxScreen />} />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/submissions-inbox-setup"
        element={<SubmissionsInboxSetupScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/energy-step"
        element={<EnergyStepRequirementsScreen />}
      />
      <Route path="/permit-applications/:permitApplicationId" element={<ReviewPermitApplicationScreen />} />
      {import.meta.env.DEV && (
        <>
          <Route
            path="/permit-applications/:permitApplicationId/pdf-content"
            element={<PermitApplicationPDFViewer mode={"pdf"} />}
          />
          <Route
            path="/permit-applications/:permitApplicationId/pdf-html"
            element={<PermitApplicationPDFViewer mode={"html"} />}
          />
        </>
      )}
    </>
  )

  const submitterOnlyRoutes = (
    <>
      <Route path="/permit-applications/:permitApplicationId/edit" element={<EditPermitApplicationScreen />}>
        <Route path="step-code" element={<StepCodeForm />} />
      </Route>
      <Route
        path="/permit-applications/:permitApplicationId/sucessful-submission"
        element={<SuccessfulSubmissionScreen />}
      />
    </>
  )

  const reviewManagerOnlyRoutes = (
    <>
      <Route
        path="/digital-building-permits/:templateVersionId/edit"
        element={<JurisdictionEditDigitalPermitScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management"
        element={<ConfigurationManagementScreen />}
      />
      <Route path="/digital-building-permits" element={<JurisdictionDigitalPermitScreen />} />
    </>
  )

  return (
    <>
      <Routes location={background || location}>
        <Route path="/welcome" element={<LandingScreen />} />
        {loggedIn ? (
          <>
            <Route path="/" element={<HomeScreen />} />
            {currentUser?.isSuperAdmin ? null : <Route path="/jurisdictions" element={<RedirectScreen />} />}
            <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
            <Route path="/permit-applications/new" element={<NewPermitApplicationScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />

            {(currentUser?.isReviewManager || currentUser?.isReviewer) && managerOrReviewerRoutes}
            {currentUser?.isSuperAdmin && superAdminOnlyRoutes}
            {(currentUser?.isSuperAdmin || currentUser?.isReviewManager) && adminOrManagerRoutes}
            {currentUser?.isSubmitter && submitterOnlyRoutes}
            {currentUser?.isReviewManager && reviewManagerOnlyRoutes}
          </>
        ) : (
          <>
            <Route path="/" element={<RedirectScreen path="/welcome" />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
            <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
          </>
        )}
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/confirmed" element={<EmailConfirmedScreen />} />

        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
      {background && (
        <Routes>
          {currentUser?.isSubmitter && (
            <Route path="/permit-applications/:permitApplicationId/edit/step-code" element={<StepCodeForm />} />
          )}
        </Routes>
      )}
    </>
  )
})
