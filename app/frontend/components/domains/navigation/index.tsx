import { Box, Center } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, lazy, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { FlashMessage } from "../../shared/base/flash-message"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EULAModal } from "../../shared/eula-modal"
import { NavBar } from "./nav-bar"

const NotFoundScreen = lazy(() =>
  import("../../shared/base/not-found-screen").then((module) => ({ default: module.NotFoundScreen }))
)

const PermitApplicationPDFViewer = lazy(() =>
  import("../../shared/permit-applications/pdf-content/viewer").then((module) => ({
    default: module.PermitApplicationPDFViewer,
  }))
)

const EmailConfirmedScreen = lazy(() =>
  import("../authentication/email-confirmed-screen").then((module) => ({ default: module.EmailConfirmedScreen }))
)
const ForgotPasswordScreen = lazy(() =>
  import("../authentication/forgot-password-screen").then((module) => ({ default: module.ForgotPasswordScreen }))
)
const LoginScreen = lazy(() =>
  import("../authentication/login-screen").then((module) => ({ default: module.LoginScreen }))
)
const RegisterScreen = lazy(() =>
  import("../authentication/register-screen").then((module) => ({ default: module.RegisterScreen }))
)
const ResetPasswordScreen = lazy(() =>
  import("../authentication/reset-password-screen").then((module) => ({ default: module.ResetPasswordScreen }))
)
const HomeScreen = lazy(() => import("../home").then((module) => ({ default: module.HomeScreen })))
const ConfigurationManagementScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen").then((module) => ({
    default: module.ConfigurationManagementScreen,
  }))
)
const EnergyStepRequirementsScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen/energy-step-requirements-screen").then((module) => ({
    default: module.EnergyStepRequirementsScreen,
  }))
)
const SubmissionsInboxSetupScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen/submissions-inbox-setup-screen").then((module) => ({
    default: module.SubmissionsInboxSetupScreen,
  }))
)

const JurisdictionIndexScreen = lazy(() =>
  import("../jurisdictions/index").then((module) => ({ default: module.JurisdictionIndexScreen }))
)
const JurisdictionScreen = lazy(() =>
  import("../jurisdictions/jurisdiction-screen").then((module) => ({ default: module.JurisdictionScreen }))
)
const LimitedJurisdictionIndexScreen = lazy(() =>
  import("../jurisdictions/limited-jurisdiction-index-screen").then((module) => ({
    default: module.LimitedJurisdictionIndexScreen,
  }))
)
const NewJurisdictionScreen = lazy(() =>
  import("../jurisdictions/new-jurisdiction-screen").then((module) => ({ default: module.NewJurisdictionScreen }))
)
const JurisdictionSubmissionInboxScreen = lazy(() =>
  import("../jurisdictions/submission-inbox/jurisdiction-submisson-inbox-screen").then((module) => ({
    default: module.JurisdictionSubmissionInboxScreen,
  }))
)
const JurisdictionUserIndexScreen = lazy(() =>
  import("../jurisdictions/users").then((module) => ({ default: module.JurisdictionUserIndexScreen }))
)
const LandingScreen = lazy(() => import("../landing").then((module) => ({ default: module.LandingScreen })))
const ContactScreen = lazy(() => import("../misc/contact-screen").then((module) => ({ default: module.ContactScreen })))
const PermitApplicationIndexScreen = lazy(() =>
  import("../permit-application").then((module) => ({ default: module.PermitApplicationIndexScreen }))
)
const EditPermitApplicationScreen = lazy(() =>
  import("../permit-application/edit-permit-application-screen").then((module) => ({
    default: module.EditPermitApplicationScreen,
  }))
)
const NewPermitApplicationScreen = lazy(() =>
  import("../permit-application/new-permit-application-screen").then((module) => ({
    default: module.NewPermitApplicationScreen,
  }))
)
const ReviewPermitApplicationScreen = lazy(() =>
  import("../permit-application/review-permit-application-screen").then((module) => ({
    default: module.ReviewPermitApplicationScreen,
  }))
)
const SuccessfulSubmissionScreen = lazy(() =>
  import("../permit-application/successful-submission").then((module) => ({
    default: module.SuccessfulSubmissionScreen,
  }))
)
const NewRequirementTemplateScreen = lazy(() =>
  import("../requirement-template/new-requirement-template-screen").then((module) => ({
    default: module.NewRequirementTemplateScreen,
  }))
)
const EditRequirementTemplateScreen = lazy(() =>
  import("../requirement-template/screens/edit-requirement-template-screen").then((module) => ({
    default: module.EditRequirementTemplateScreen,
  }))
)
const JurisdictionDigitalPermitScreen = lazy(() =>
  import("../requirement-template/screens/jurisdiction-digital-permit-screen").then((module) => ({
    default: module.JurisdictionDigitalPermitScreen,
  }))
)
const JurisdictionEditDigitalPermitScreen = lazy(() =>
  import("../requirement-template/screens/jurisdiction-edit-digital-permit-screen").then((module) => ({
    default: module.JurisdictionEditDigitalPermitScreen,
  }))
)
const RequirementTemplatesScreen = lazy(() =>
  import("../requirement-template/screens/requirement-template-screen").then((module) => ({
    default: module.RequirementTemplatesScreen,
  }))
)
const TemplateVersionScreen = lazy(() =>
  import("../requirement-template/screens/template-version-screen").then((module) => ({
    default: module.TemplateVersionScreen,
  }))
)
const RequirementsLibraryScreen = lazy(() =>
  import("../requirements-library").then((module) => ({ default: module.RequirementsLibraryScreen }))
)
const StepCodeForm = lazy(() => import("../step-code").then((module) => ({ default: module.StepCodeForm })))
const StepCodeChecklistPDFViewer = lazy(() =>
  import("../step-code/checklist/pdf-content/viewer").then((module) => ({ default: module.StepCodeChecklistPDFViewer }))
)
const SiteConfigurationManagementScreen = lazy(() =>
  import("../super-admin/site-configuration-management-screen.tsx").then((module) => ({
    default: module.SiteConfigurationManagementScreen,
  }))
)
const AcceptInvitationScreen = lazy(() =>
  import("../users/accept-invitation-screen").then((module) => ({ default: module.AcceptInvitationScreen }))
)
const InviteScreen = lazy(() => import("../users/invite-screen").then((module) => ({ default: module.InviteScreen })))
const ProfileScreen = lazy(() =>
  import("../users/profile-screen").then((module) => ({ default: module.ProfileScreen }))
)
const RedirectScreen = lazy(() =>
  import("../../shared/base/redirect-screen").then((module) => ({ default: module.RedirectScreen }))
)
const Footer = lazy(() => import("../../shared/base/footer").then((module) => ({ default: module.Footer })))

export const Navigation = observer(() => {
  const { sessionStore, siteConfigurationStore } = useMst()
  const { isLoggingOut } = sessionStore
  const { displaySitewideMessage, sitewideMessage } = siteConfigurationStore
  const { validateToken, isValidating } = sessionStore
  const { t } = useTranslation()

  useEffect(() => {
    validateToken()
  }, [])

  if (isLoggingOut) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Box pos="relative" w="full">
        <Box pos="absolute" top={0} zIndex="toast" w="full">
          <FlashMessage />
        </Box>
      </Box>
      {displaySitewideMessage && (
        <Center h={16} bg="theme.yellowLight">
          {sitewideMessage}
        </Center>
      )}
      <NavBar />
      <EULAModal />

      {isValidating ? (
        <LoadingScreen />
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <AppRoutes />

          <Footer />
        </Suspense>
      )}
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
      <Route path="/configuration-management" element={<SiteConfigurationManagementScreen />} />
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
          <Route
            path="/permit-applications/:permitApplicationId/step-code-pdf-content"
            element={<StepCodeChecklistPDFViewer mode={"pdf"} />}
          />
          <Route
            path="/permit-applications/:permitApplicationId/step-code-pdf-html"
            element={<StepCodeChecklistPDFViewer mode={"html"} />}
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
        {loggedIn ? (
          <>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
            <Route path="/permit-applications/new" element={<NewPermitApplicationScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />

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
            <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
          </>
        )}
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/confirmed" element={<EmailConfirmedScreen />} />
        <Route path="/welcome" element={<LandingScreen />} />
        <Route path="/jurisdictions" element={<LimitedJurisdictionIndexScreen />} />
        <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
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
