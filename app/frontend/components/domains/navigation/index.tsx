import { Box, Center } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, lazy, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom"
import useSyncPathWithStore from "../../../hooks/use-sync-path-with-root-store"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { FlashMessage } from "../../shared/base/flash-message"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EULAScreen } from "../onboarding/eula"
import { NavBar } from "./nav-bar"
import { ProtectedRoute } from "./protected-route"

const ExternalApiKeysIndexScreen = lazy(() =>
  import("../external-api-key").then((module) => ({ default: module.ExternalApiKeysIndexScreen }))
)

const AdminInviteScreen = lazy(() =>
  import("../users/admin-invite-screen").then((module) => ({ default: module.AdminInviteScreen }))
)

const ExternalApiKeyModalSubRoute = lazy(() =>
  import("../external-api-key/external-api-key-modal-sub-route").then((module) => ({
    default: module.ExternalApiKeyModalSubRoute,
  }))
)

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
const LoginScreen = lazy(() =>
  import("../authentication/login-screen").then((module) => ({ default: module.LoginScreen }))
)
const HomeScreen = lazy(() => import("../home").then((module) => ({ default: module.HomeScreen })))
const ConfigurationManagementScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen").then((module) => ({
    default: module.ConfigurationManagementScreen,
  }))
)
const TechnicalSupportConfigurationManagementScreen = lazy(() =>
  import("../home/technical-support/configuration-management-screen").then((module) => ({
    default: module.ConfigurationManagementScreen,
  }))
)
const EnergyStepRequirementsScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen/energy-step-requirements-screen").then((module) => ({
    default: module.EnergyStepRequirementsScreen,
  }))
)
const ReviewManagerFeatureAccessScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen/feature-access-screen").then((module) => ({
    default: module.ReviewManagerFeatureAccessScreen,
  }))
)
const SubmissionsInboxSetupScreenLazy = lazy(() =>
  import("../home/review-manager/configuration-management-screen/submissions-inbox-setup-screen").then((module) => ({
    default: module.SubmissionsInboxSetupScreen,
  }))
)
const ReviewStaffMyJurisdictionAboutPageScreen = lazy(() =>
  import(
    "../home/review-manager/configuration-management-screen/feature-access-screen/my-jurisdiction-about-page"
  ).then((module) => ({
    default: module.myJurisdictionAboutPageScreen,
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
const EditJurisdictionScreen = lazy(() =>
  import("../jurisdictions/edit-jurisdiction-screen").then((module) => ({ default: module.EditJurisdictionScreen }))
)
const LandingScreen = lazy(() => import("../landing").then((module) => ({ default: module.LandingScreen })))
const ContactScreen = lazy(() => import("../misc/contact-screen").then((module) => ({ default: module.ContactScreen })))
const ProjectReadinessToolsIndexScreen = lazy(() =>
  import("../project-readiness-tools").then((module) => ({ default: module.ProjectReadinessToolsIndexScreen }))
)
const LettersOfAssuranceScreen = lazy(() =>
  import("../project-readiness-tools/letter-of-assurance").then((module) => ({
    default: module.LettersOfAssuranceScreen,
  }))
)
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
const JurisdictionApiMappingsSetupIndexScreen = lazy(() =>
  import("../requirement-template/screens/jurisdiction-api-mappings-setup-index-screen").then((module) => ({
    default: module.JurisdictionApiMappingsSetupIndexScreen,
  }))
)

const EditJurisdictionApiMappingScreen = lazy(() =>
  import("../requirement-template/screens/edit-jurisdiction-api-mapping-screen").then((module) => ({
    default: module.EditJurisdictionApiMappingScreen,
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

const ExportTemplatesScreen = lazy(() =>
  import("../jurisdictions/exports/export-templates-screen").then((module) => ({
    default: module.ExportTemplatesScreen,
  }))
)

const RequirementsLibraryScreen = lazy(() =>
  import("../requirements-library").then((module) => ({ default: module.RequirementsLibraryScreen }))
)
const Part9StepCodeForm = lazy(() =>
  import("../step-code/part-9").then((module) => ({ default: module.Part9StepCodeForm }))
)
const Part3StepCodeForm = lazy(() =>
  import("../step-code/part-3").then((module) => ({ default: module.Part3StepCodeForm }))
)
const StepCodeChecklistPDFViewer = lazy(() =>
  import("../step-code/checklist/pdf-content/viewer").then((module) => ({
    default: module.StepCodeChecklistPDFViewer,
  }))
)
const SiteConfigurationManagementScreen = lazy(() =>
  import("../super-admin/site-configuration-management").then((module) => ({
    default: module.SiteConfigurationManagementScreen,
  }))
)
const SitewideMessageScreen = lazy(() =>
  import("../super-admin/site-configuration-management/sitewide-message-screen").then((module) => ({
    default: module.SitewideMessageScreen,
  }))
)
const HelpDrawerSetupScreen = lazy(() =>
  import("../super-admin/site-configuration-management/help-drawer-setup-screen").then((module) => ({
    default: module.HelpDrawerSetupScreen,
  }))
)

const RevisionReasonSetupScreen = lazy(() =>
  import("../super-admin/site-configuration-management/revision-reason-setup-screen").then((module) => ({
    default: module.RevisionReasonSetupScreen,
  }))
)

const LandingSetupScreen = lazy(() =>
  import("../super-admin/site-configuration-management/landing-setup-screen").then((module) => ({
    default: module.LandingSetupScreen,
  }))
)

const AdminUserIndexScreen = lazy(() =>
  import("../super-admin/site-configuration-management/users-screen").then((module) => ({
    default: module.AdminUserIndexScreen,
  }))
)

const AdminGlobalFeatureAccessScreen = lazy(() =>
  import("../super-admin/site-configuration-management/global-feature-access").then((module) => ({
    default: module.AdminGlobalFeatureAccessScreen,
  }))
)

const InboxFeatureAccessScreen = lazy(() =>
  import("../super-admin/site-configuration-management/inbox-feature-access").then((module) => ({
    default: module.InboxFeatureAccessScreen,
  }))
)

const ReportingScreen = lazy(() =>
  import("../super-admin/reporting/reporting-screen").then((module) => ({ default: module.ReportingScreen }))
)

const ExportTemplateSummaryScreen = lazy(() =>
  import("../super-admin/reporting/export-template-summary-screen").then((module) => ({
    default: module.ExportTemplateSummaryScreen,
  }))
)

const EarlyAccessScreen = lazy(() =>
  import("../super-admin/early-access/early-access-screen").then((module) => ({
    default: module.EarlyAccessScreen,
  }))
)

const EarlyAccessRequirementTemplatesIndexScreen = lazy(() =>
  import("../super-admin/early-access/requirement-templates").then((module) => ({
    default: module.EarlyAccessRequirementTemplatesIndexScreen,
  }))
)

const EarlyAccessRequirementTemplateScreen = lazy(() =>
  import("../super-admin/early-access/requirement-templates/early-access-requirement-template-screen").then(
    (module) => ({
      default: module.EarlyAccessRequirementTemplateScreen,
    })
  )
)

const NewEarlyAccessRequirementTemplateScreen = lazy(() =>
  import("../super-admin/early-access/requirement-templates/new-early-access-requirement-template-screen").then(
    (module) => ({
      default: module.NewEarlyAccessRequirementTemplateScreen,
    })
  )
)

const EditEarlyAccessRequirementTemplateScreen = lazy(() =>
  import("../super-admin/early-access/requirement-templates/edit-early-access-requirement-template-screen").then(
    (module) => ({
      default: module.EditEarlyAccessRequirementTemplateScreen,
    })
  )
)

const EarlyAccessRequirementsLibraryScreen = lazy(() =>
  import("../super-admin/early-access/requirements-library").then((module) => ({
    default: module.EarlyAccessRequirementsLibraryScreen,
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
  const { sessionStore, siteConfigurationStore, subscribeToUserChannel } = useMst()
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
  const rootStore = useMst()
  const { sessionStore, userStore, uiStore } = rootStore
  const { loggedIn, tokenExpired } = sessionStore
  const location = useLocation()
  const background = location.state && location.state.background

  const { currentUser } = userStore
  const { afterLoginPath, setAfterLoginPath, resetAuth } = sessionStore

  const navigate = useNavigate()
  const { t } = useTranslation()

  if (currentUser === undefined) {
    console.log("AppRoutes: currentUser is undefined, rendering LoadingScreen.")
    return <LoadingScreen />
  }

  useEffect(() => {
    if (tokenExpired) {
      resetAuth()
      setAfterLoginPath(location.pathname)
      navigate("/login")
      uiStore.flashMessage.show(EFlashMessageStatus.warning, t("auth.tokenExpired"), null)
    }
  }, [tokenExpired])

  useEffect(() => {
    if (loggedIn && afterLoginPath) {
      setAfterLoginPath(null)
      navigate(afterLoginPath)
    }
  }, [afterLoginPath, loggedIn])

  useSyncPathWithStore()

  // Step 2: Safely derive booleans from currentUser. These default to false if currentUser is null.
  const isReviewStaff = currentUser ? currentUser.isReviewStaff : false
  const isReviewer = currentUser ? currentUser.isReviewer : false
  const isReviewManager = currentUser ? currentUser.isReviewManager : false
  const isRegionalReviewManager = currentUser ? currentUser.isRegionalReviewManager : false
  const isTechnicalSupport = currentUser ? currentUser.isTechnicalSupport : false
  const eulaAccepted = currentUser ? currentUser.eulaAccepted : false
  const isSuperAdmin = currentUser ? currentUser.isSuperAdmin : false
  const isUnconfirmed = currentUser ? currentUser.isUnconfirmed : false

  // Step 3: Use these safe booleans in further logic
  const mustAcceptEula = loggedIn && !eulaAccepted && !isSuperAdmin

  const superAdminOnlyRoutes = (
    <>
      <Route path="/jurisdictions/new" element={<NewJurisdictionScreen />} />
      <Route path="/requirements-library" element={<RequirementsLibraryScreen />} />
      <Route path="/early-access/requirements-library" element={<EarlyAccessRequirementsLibraryScreen />} />
      <Route path="/requirement-templates" element={<RequirementTemplatesScreen />} />
      <Route path="/early-access/requirement-templates" element={<EarlyAccessRequirementTemplatesIndexScreen />} />
      <Route path="/early-access/requirement-templates/new" element={<NewEarlyAccessRequirementTemplateScreen />} />
      <Route
        path="/early-access/requirement-templates/:requirementTemplateId/edit"
        element={<EditEarlyAccessRequirementTemplateScreen />}
      />
      <Route path="/requirement-templates/new" element={<NewRequirementTemplateScreen />} />
      <Route path="/requirement-templates/:requirementTemplateId/edit" element={<EditRequirementTemplateScreen />} />
      <Route path="/template-versions/:templateVersionId" element={<TemplateVersionScreen />} />
      <Route path="/configuration-management" element={<SiteConfigurationManagementScreen />} />
      <Route path="/configuration-management/sitewide-message" element={<SitewideMessageScreen />} />
      <Route path="/configuration-management/help-drawer-setup" element={<HelpDrawerSetupScreen />} />
      <Route path="/configuration-management/revision-reason-setup" element={<RevisionReasonSetupScreen />} />
      <Route path="/configuration-management/landing-setup" element={<LandingSetupScreen />} />
      <Route path="/configuration-management/users" element={<AdminUserIndexScreen />} />
      <Route path="/configuration-management/global-feature-access" element={<AdminGlobalFeatureAccessScreen />} />
      <Route
        path="/configuration-management/global-feature-access/submission-inbox"
        element={<InboxFeatureAccessScreen />}
      />
      <Route path="/configuration-management/users/invite" element={<AdminInviteScreen />} />
      <Route path="/reporting" element={<ReportingScreen />} />
      <Route path="/reporting/export-template-summary" element={<ExportTemplateSummaryScreen />} />
      <Route path="/early-access" element={<EarlyAccessScreen />} />
    </>
  )

  const adminOrManagerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/users" element={<JurisdictionUserIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/update" element={<EditJurisdictionScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/users/invite" element={<InviteScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/export-templates" element={<ExportTemplatesScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/api-settings" element={<ExternalApiKeysIndexScreen />}>
        <Route path="create" element={<ExternalApiKeyModalSubRoute />} />
        <Route path=":externalApiKeyId/manage" element={<ExternalApiKeyModalSubRoute />} />
      </Route>
    </>
  )

  const technicalSupportRoutes = (
    <>
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management"
        element={<TechnicalSupportConfigurationManagementScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access"
        element={<ReviewManagerFeatureAccessScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/submissions-inbox-setup"
        element={
          <SubmissionsInboxSetupScreenLazy
            editPageUrl={`/jurisdictions/${useParams().jurisdictionId}/configuration-management/feature-access`}
          />
        }
      />
    </>
  )

  const managerOrReviewerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/submission-inbox" element={<JurisdictionSubmissionInboxScreen />} />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/my-jurisdiction-about-page"
        element={<ReviewStaffMyJurisdictionAboutPageScreen />}
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

  const reviewManagerOnlyRoutes = (
    <>
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access"
        element={<ReviewManagerFeatureAccessScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/submissions-inbox-setup"
        element={
          <SubmissionsInboxSetupScreenLazy
            editPageUrl={`/jurisdictions/${useParams().jurisdictionId}/configuration-management/feature-access`}
          />
        }
      />
      <Route
        path="/digital-building-permits/:templateVersionId/edit"
        element={<JurisdictionEditDigitalPermitScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management"
        element={<ConfigurationManagementScreen />}
      />
      <Route path="/digital-building-permits" element={<JurisdictionDigitalPermitScreen />} />
      <Route path="/api-settings/api-mappings" element={<JurisdictionApiMappingsSetupIndexScreen />} />
      <Route
        path="/jurisdictions/:jurisdictionId/api-settings/api-mappings/digital-building-permits/:templateVersionId/edit"
        element={<EditJurisdictionApiMappingScreen />}
      />
      <Route
        path="/api-settings/api-mappings/digital-building-permits/:templateVersionId/edit"
        element={<EditJurisdictionApiMappingScreen />}
      />
    </>
  )

  console.log("--- Debugging ProtectedRoute conditions ---")
  console.log("loggedIn:", loggedIn)
  console.log("currentUser (object or null):", currentUser)
  console.log("mustAcceptEula (based on safe booleans):", mustAcceptEula)
  console.log("isReviewStaff (safe boolean):", isReviewStaff)
  console.log("isReviewer (safe boolean):", isReviewer)
  console.log("isReviewManager (safe boolean):", isReviewManager)
  console.log("isRegionalReviewManager (safe boolean):", isRegionalReviewManager)
  console.log("isTechnicalSupport (safe boolean):", isTechnicalSupport)
  console.log("eulaAccepted (safe boolean):", eulaAccepted)
  console.log("isSuperAdmin (safe boolean):", isSuperAdmin)
  console.log("isUnconfirmed (safe boolean):", isUnconfirmed)

  // Step 4: Calculate isAllowed props using safe booleans
  const isAllowedForAdminOrManager =
    loggedIn && !mustAcceptEula && (isReviewManager || isRegionalReviewManager || isSuperAdmin || isTechnicalSupport)
  console.log("isAllowed for adminOrManagerRoutes:", isAllowedForAdminOrManager)

  const isAllowedForManagerOrReviewer = loggedIn && !mustAcceptEula && isReviewStaff
  console.log("isAllowed for managerOrReviewerRoutes:", isAllowedForManagerOrReviewer)

  const isAllowedForTechnicalSupport = loggedIn && !mustAcceptEula && isTechnicalSupport
  console.log("isAllowed for technicalSupportRoutes:", isAllowedForTechnicalSupport)

  const isAllowedForReviewManagerOnly = loggedIn && !mustAcceptEula && isReviewStaff && !isReviewer
  console.log("isAllowed for reviewManagerOnlyRoutes:", isAllowedForReviewManagerOnly)
  console.log("--- End Debugging --- ")

  return (
    <>
      <Routes location={background || location}>
        {mustAcceptEula && (
          // Onboarding step 1: EULA
          <Route path="/" element={<EULAScreen />} />
        )}
        {loggedIn && eulaAccepted && isUnconfirmed && (
          // Onboarding step 2: confirm email
          <Route path="/" element={<ProfileScreen />} />
        )}
        {loggedIn ? (
          <Route path="/" element={<HomeScreen />} />
        ) : (
          <Route path="/" element={<RedirectScreen path="/welcome" />} />
        )}
        <Route
          element={<ProtectedRoute isAllowed={loggedIn && !mustAcceptEula} redirectPath={mustAcceptEula && "/"} />}
        >
          <Route path="/permit-applications" element={<PermitApplicationIndexScreen />} />
          <Route path="/permit-applications/new" element={<NewPermitApplicationScreen />} />
          <Route path="/permit-applications/:permitApplicationId/edit" element={<EditPermitApplicationScreen />} />
          <Route
            path="/permit-applications/:permitApplicationId/edit/part-9-step-code"
            element={<Part9StepCodeForm />}
          />
          <Route
            path="/permit-applications/:permitApplicationId/edit/part-3-step-code"
            element={<Part3StepCodeForm />}
          />
          <Route
            path="/permit-applications/:permitApplicationId/edit/part-3-step-code/:section"
            element={<Part3StepCodeForm />}
          />
          <Route
            path="/permit-applications/:permitApplicationId/sucessful-submission"
            element={<SuccessfulSubmissionScreen />}
          />
        </Route>

        <Route element={<ProtectedRoute isAllowed={loggedIn} />}>
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>

        <Route element={<ProtectedRoute isAllowed={loggedIn && !currentUser?.isSuperAdmin} />}>
          <Route path="/profile/eula" element={<EULAScreen withClose />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForAdminOrManager}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {adminOrManagerRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute isAllowed={loggedIn && currentUser.isSuperAdmin} redirectPath={loggedIn && "/not-found"} />
          }
        >
          {superAdminOnlyRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForManagerOrReviewer}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {managerOrReviewerRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForTechnicalSupport}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {technicalSupportRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForReviewManagerOnly}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {reviewManagerOnlyRoutes}
        </Route>

        <Route element={<ProtectedRoute isAllowed={!loggedIn} redirectPath="/" />}>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/admin" element={<LoginScreen isAdmin />} />
        </Route>
        {/* Public Routes */}
        <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/project-readiness-tools" element={<ProjectReadinessToolsIndexScreen />} />
        <Route
          path="/project-readiness-tools/create-your-letters-of-assurance"
          element={<LettersOfAssuranceScreen />}
        />
        <Route path="/confirmed" element={<EmailConfirmedScreen />} />
        <Route path="/welcome" element={<LandingScreen />} />
        <Route
          path="/early-access/requirement-templates/:requirementTemplateId"
          element={<EarlyAccessRequirementTemplateScreen />}
        />
        <Route
          path="/jurisdictions"
          element={currentUser?.isSuperAdmin ? <JurisdictionIndexScreen /> : <LimitedJurisdictionIndexScreen />}
        />
        <Route path="/jurisdictions/:jurisdictionId" element={<JurisdictionScreen />} />
        <Route path="/part-3-step-code" element={<RedirectScreen path="start" />} />
        <Route path="/part-3-step-code/:section" element={<Part3StepCodeForm />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </>
  )
})
