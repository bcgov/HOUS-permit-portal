import { Box, Center } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, lazy, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
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

const StandardizationPreviewScreen = lazy(() =>
  import("../landing/standardization-preview-screen").then((module) => ({
    default: module.StandardizationPreviewScreen,
  }))
)

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
const ResourcesScreenLazy = lazy(() =>
  import("../home/review-manager/configuration-management-screen/resources-screen").then((module) => ({
    default: module.ResourcesScreen,
  }))
)
const ReviewStaffMyJurisdictionAboutPageScreen = lazy(() =>
  import(
    "../home/review-manager/configuration-management-screen/feature-access-screen/my-jurisdiction-about-page"
  ).then((module) => ({
    default: module.myJurisdictionAboutPageScreen,
  }))
)

const DesignatedReviewerScreen = lazy(() =>
  import("../home/review-manager/configuration-management-screen/feature-access-screen/designated-reviewer").then(
    (module) => ({
      default: module.DesignatedReviewerScreen,
    })
  )
)

const JurisdictionIndexScreen = lazy(() =>
  import("../jurisdictions/index").then((module) => ({ default: module.JurisdictionIndexScreen }))
)
const JurisdictionScreen = lazy(() =>
  import("../jurisdictions/jurisdiction-screen").then((module) => ({ default: module.JurisdictionScreen }))
)
const JurisdictionStepCodeRequirementsScreen = lazy(() =>
  import("../jurisdictions/step-code-requirements-screen").then((module) => ({
    default: module.JurisdictionStepCodeRequirementsScreen,
  }))
)
const LimitedJurisdictionIndexScreen = lazy(() =>
  import("../jurisdictions/limited-jurisdiction-index-screen").then((module) => ({
    default: module.LimitedJurisdictionIndexScreen,
  }))
)
const NewJurisdictionScreen = lazy(() =>
  import("../jurisdictions/new-jurisdiction-screen").then((module) => ({ default: module.NewJurisdictionScreen }))
)
const PrivacyPolicyScreen = lazy(() =>
  import("../misc/privacy-policy-screen").then((module) => ({ default: module.PrivacyPolicyScreen }))
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
const LookUpStepCodesRequirementsForYourProjectScreen = lazy(() =>
  import("../project-readiness-tools/look-up-step-codes-requirements-for-your-project").then((module) => ({
    default: module.LookUpStepCodesRequirementsForYourProjectScreen,
  }))
)
const CheckDigitalSealsScreen = lazy(() =>
  import("../project-readiness-tools/check-digital-seals").then((module) => ({
    default: module.CheckDigitalSealsScreen,
  }))
)
const PreCheckInfoScreen = lazy(() =>
  import("../project-readiness-tools/pre-check-info-screen").then((module) => ({
    default: module.PreCheckInfoScreen,
  }))
)

const CheckStepCodeRequirementsScreen = lazy(() =>
  import("../project-readiness-tools/check-step-code-requirements").then((module) => ({
    default: module.CheckStepCodeRequirementsScreen,
  }))
)
const SelectStepCodeRequirementsScreen = lazy(() =>
  import("../project-readiness-tools/check-step-code-requirements/select-step-code-requirements-screen").then(
    (module) => ({
      default: module.SelectStepCodeRequirementsScreen,
    })
  )
)
const OnboardingChecklistPageForLgAdoptingScreen = lazy(() =>
  import("../onboarding/onboarding-checklist-page-for-lg-adopting-screen").then((module) => ({
    default: module.OnboardingChecklistPageForLgAdoptingScreen,
  }))
)

const OverheatingToolScreen = lazy(() =>
  import("../overheating-tool/overheating-tool-screen").then((module) => ({
    default: module.OverheatingToolScreen,
  }))
)
const OverheatingToolStartScreen = lazy(() =>
  import("../overheating-tool/overheating-tool-start-screen").then((module) => ({
    default: module.OverheatingToolStartScreen,
  }))
)

const PermitApplicationIndexScreen = lazy(() =>
  import("../permit-application").then((module) => ({ default: module.PermitApplicationIndexScreen }))
)
const ProjectDashboardScreen = lazy(() =>
  import("../permit-project").then((module) => ({ default: module.ProjectDashboardScreen }))
)
const NewPermitProjectScreen = lazy(() =>
  import("../permit-project/new-permit-project-screen").then((module) => ({ default: module.NewPermitProjectScreen }))
)
const PermitProjectScreen = lazy(() =>
  import("../permit-project/permit-project-screen").then((module) => ({ default: module.PermitProjectScreen }))
)
const AddPermitApplicationToProjectScreen = lazy(() =>
  import("../permit-project/add-permit-application-screen").then((module) => ({
    default: module.AddPermitApplicationToProjectScreen,
  }))
)
const EditPermitApplicationScreen = lazy(() =>
  import("../permit-application/edit-permit-application-screen").then((module) => ({
    default: module.EditPermitApplicationScreen,
  }))
)

// Disabled: New Permit Application screen removed
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
const PreCheckForm = lazy(() => import("../pre-check").then((module) => ({ default: module.PreCheckForm })))
const PreCheckViewer = lazy(() =>
  import("../pre-check/pre-check-viewer").then((module) => ({ default: module.PreCheckViewer }))
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
const PermitClassificationsScreen = lazy(() =>
  import("../super-admin/site-configuration-management/permit-classifications-screen").then((module) => ({
    default: module.PermitClassificationsScreen,
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

const StandardizationSetupScreen = lazy(() =>
  import("../super-admin/site-configuration-management/standardization-setup-screen").then((module) => ({
    default: module.StandardizationSetupScreen,
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

const AdminSubmissionInboxScreen = lazy(() =>
  import("../super-admin/site-configuration-management/submission-inbox").then((module) => ({
    default: module.AdminSubmissionInboxScreen,
  }))
)

const AdminDesignatedReviewerScreen = lazy(() =>
  import("../super-admin/site-configuration-management/designated-reviewer-screen").then((module) => ({
    default: module.AdminDesignatedReviewerScreen,
  }))
)

const CodeComplianceSetupScreen = lazy(() =>
  import("../super-admin/site-configuration-management/code-compliance-setup-screen").then((module) => ({
    default: module.CodeComplianceSetupScreen,
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

  if (isLoggingOut) return <LoadingScreen message={t("site.loggingOut")} />

  return (
    <BrowserRouter>
      <Box pos="relative" w="full">
        <Box pos="absolute" top={0} zIndex="toast" w="full">
          <FlashMessage />
        </Box>
      </Box>
      {displaySitewideMessage && (
        <Center h={16} bg="theme.yellowLight" zIndex={1500}>
          {sitewideMessage}
        </Center>
      )}
      <NavBar />

      {isValidating ? (
        <LoadingScreen message={t("site.validating")} />
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
  const { siteConfigurationStore, sessionStore, userStore, uiStore } = rootStore
  const { loggedIn, tokenExpired, resetAuth, afterLoginPath, setAfterLoginPath } = sessionStore
  const location = useLocation()
  const background = location.state && location.state.background

  const { currentUser } = userStore

  const navigate = useNavigate()
  const { t } = useTranslation()
  const { allowDesignatedReviewer } = siteConfigurationStore
  if (currentUser === undefined) {
    console.log("AppRoutes: currentUser is undefined, rendering LoadingScreen.")
    return <LoadingScreen />
  }

  useEffect(() => {
    if (loggedIn && afterLoginPath) {
      navigate(afterLoginPath)
      setAfterLoginPath(null)
    }
  }, [loggedIn, afterLoginPath])

  useEffect(() => {
    if (tokenExpired) {
      resetAuth()
      setAfterLoginPath(location.pathname)
      navigate("/login")
      uiStore.flashMessage.show(EFlashMessageStatus.warning, null, t("auth.tokenExpired"), 3000)
    }
  }, [tokenExpired])

  useSyncPathWithStore()

  // Step 2: Safely derive booleans from currentUser. These default to false if currentUser is null.
  const isReviewStaff = currentUser ? currentUser.isReviewStaff : false
  const isReviewManager = currentUser ? currentUser.isReviewManager : false
  const isRegionalReviewManager = currentUser ? currentUser.isRegionalReviewManager : false
  const isTechnicalSupport = currentUser ? currentUser.isTechnicalSupport : false
  const eulaAccepted = currentUser ? currentUser.eulaAccepted : false
  const isSuperAdmin = currentUser ? currentUser.isSuperAdmin : false
  const isUnconfirmed = currentUser ? currentUser.isUnconfirmed : false

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
      <Route path="/configuration-management/permit-classifications" element={<PermitClassificationsScreen />} />
      <Route path="/configuration-management/sitewide-message" element={<SitewideMessageScreen />} />
      <Route path="/configuration-management/help-drawer-setup" element={<HelpDrawerSetupScreen />} />
      <Route path="/configuration-management/revision-reason-setup" element={<RevisionReasonSetupScreen />} />
      <Route path="/configuration-management/standardization-setup" element={<StandardizationSetupScreen />} />
      <Route path="/configuration-management/users" element={<AdminUserIndexScreen />} />
      <Route path="/configuration-management/global-feature-access" element={<AdminGlobalFeatureAccessScreen />} />
      <Route
        path="/configuration-management/global-feature-access/submission-inbox"
        element={<AdminSubmissionInboxScreen />}
      />
      <Route
        path="/configuration-management/global-feature-access/access-control-for-revision-requests-to-submitters"
        element={<AdminDesignatedReviewerScreen />}
      />
      <Route
        path="/configuration-management/global-feature-access/code-compliance"
        element={<CodeComplianceSetupScreen />}
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
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/energy-step"
        element={<EnergyStepRequirementsScreen />}
      />
    </>
  )

  const technicalSupportOrManagerRoutes = (
    <>
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management"
        element={<ConfigurationManagementScreen />}
      />
      <Route path="/jurisdictions/:jurisdictionId/users" element={<JurisdictionUserIndexScreen />} />
      <Route path="/jurisdictions/:jurisdictionId/users/invite" element={<InviteScreen />} />
    </>
  )

  const managerOrReviewerRoutes = (
    <>
      <Route path="/jurisdictions/:jurisdictionId/submission-inbox" element={<JurisdictionSubmissionInboxScreen />} />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/my-jurisdiction-about-page"
        element={<ReviewStaffMyJurisdictionAboutPageScreen />}
      />
      {allowDesignatedReviewer && (
        <Route
          path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/limit-who-can-request-revisions-from-submitters"
          element={<DesignatedReviewerScreen />}
        />
      )}
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
        path="/digital-building-permits/:templateVersionId/edit"
        element={<JurisdictionEditDigitalPermitScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access"
        element={<ReviewManagerFeatureAccessScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/my-jurisdiction-about-page"
        element={<ReviewManagerFeatureAccessScreen />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access/submissions-inbox-setup"
        element={<SubmissionsInboxSetupScreenLazy />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/resources"
        element={<ResourcesScreenLazy />}
      />
      <Route
        path="/jurisdictions/:jurisdictionId/configuration-management/feature-access"
        element={<ReviewManagerFeatureAccessScreen />}
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

  const mustAcceptEula = loggedIn && !currentUser.eulaAccepted && !currentUser.isSuperAdmin

  // Step 4: Calculate isAllowed props using safe booleans
  const isAllowedForAdminOrManager =
    loggedIn && !mustAcceptEula && (isReviewManager || isRegionalReviewManager || isSuperAdmin || isTechnicalSupport)

  const isAllowedForManagerOrReviewer = loggedIn && !mustAcceptEula && isReviewStaff
  const isAllowedForReviewManagerOnly = loggedIn && !mustAcceptEula && (isReviewManager || isRegionalReviewManager)
  const isAllowedForTechnicalSupportOrManager =
    loggedIn && !mustAcceptEula && (isTechnicalSupport || isAllowedForReviewManagerOnly)

  return (
    <>
      <Routes location={background || location}>
        {mustAcceptEula && (
          // Onboarding step 1: EULA
          <Route path="/" element={<EULAScreen />} />
        )}
        {loggedIn && eulaAccepted && isUnconfirmed && (
          // Onboarding step 2: confirm email - only profile screens available
          <>
            <Route path="/" element={<ProfileScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/eula" element={<EULAScreen withClose />} />
            <Route path="*" element={<RedirectScreen path="/" />} />
          </>
        )}
        {loggedIn && !isUnconfirmed && <Route path="/" element={<HomeScreen />} />}
        {!loggedIn && <Route path="/" element={<RedirectScreen path="/welcome" />} />}
        <Route
          element={
            <ProtectedRoute
              isAllowed={loggedIn && !mustAcceptEula && !isUnconfirmed}
              redirectPath={mustAcceptEula && "/"}
            />
          }
        >
          {/* Migrate old permit-projects paths to new structure */}
          <Route path="/permit-projects" element={<RedirectScreen path="/projects" />} />
          <Route path="/permit-projects/projects/*" element={<RedirectScreen path="/projects" />} />
          <Route path="/permit-projects/step-codes/*" element={<RedirectScreen path="/step-codes" />} />
          {/* Disabled: New Permit Application screen */}
          <Route path="/permit-applications/:permitApplicationId/edit" element={<EditPermitApplicationScreen />} />
          <Route
            element={<ProtectedRoute isAllowed={loggedIn && !mustAcceptEula} redirectPath={mustAcceptEula && "/"} />}
          >
            <Route path="/step-codes" element={<ProjectDashboardScreen />} />
            <Route path="/overheating" element={<ProjectDashboardScreen />} />
            <Route path="/pre-checks" element={<ProjectDashboardScreen />} />
            <Route path="/pre-checks/new" element={<PreCheckForm />} />
            <Route path="/pre-checks/new/:section" element={<PreCheckForm />} />
            <Route path="/pre-checks/:preCheckId/edit/" element={<PreCheckForm />} />
            <Route path="/pre-checks/:preCheckId/edit/:section" element={<PreCheckForm />} />
            <Route path="/pre-checks/:preCheckId/viewer" element={<PreCheckViewer />} />
            <Route path="/documents" element={<ProjectDashboardScreen />} />
            {/* Already handled above with path-based tabs */}
            <Route path="/projects" element={<ProjectDashboardScreen />} />
            <Route path="/projects/new" element={<NewPermitProjectScreen />} />
            <Route path="/projects/:permitProjectId/*" element={<PermitProjectScreen />} />
            <Route path="/projects/:permitProjectId/add-permits" element={<AddPermitApplicationToProjectScreen />} />
            <Route path="/step-codes/*" element={<ProjectDashboardScreen />} />
            {/* Disabled: New Permit Application screen */}
            <Route path="/permit-applications/:permitApplicationId/edit" element={<EditPermitApplicationScreen />} />
            <Route
              path="/permit-applications/:permitApplicationId/edit/part-9-step-code"
              element={<Part9StepCodeForm />}
            />
            <Route path="/part-9-step-code/:stepCodeId" element={<Part9StepCodeForm />} />
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
            <Route
              path="/project-readiness-tools/check-step-code-requirements/select"
              element={<SelectStepCodeRequirementsScreen />}
            />
            <Route path="/project-readiness-tools/pre-check" element={<PreCheckInfoScreen />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute isAllowed={loggedIn && currentUser?.isSubmitter} />}>
          <Route path="/overheating-tool/start" element={<OverheatingToolStartScreen />} />
        </Route>

        <Route element={<ProtectedRoute isAllowed={loggedIn && !isUnconfirmed} />}>
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>

        <Route element={<ProtectedRoute isAllowed={loggedIn && !currentUser?.isSuperAdmin && !isUnconfirmed} />}>
          <Route path="/profile/eula" element={<EULAScreen withClose />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForAdminOrManager && !isUnconfirmed}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {adminOrManagerRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={loggedIn && currentUser.isSuperAdmin && !isUnconfirmed}
              redirectPath={loggedIn && "/not-found"}
            />
          }
        >
          {superAdminOnlyRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForManagerOrReviewer && !isUnconfirmed}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {managerOrReviewerRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForTechnicalSupportOrManager && !isUnconfirmed}
              redirectPath={(mustAcceptEula && "/") || (loggedIn && "/not-found")}
            />
          }
        >
          {technicalSupportOrManagerRoutes}
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAllowedForReviewManagerOnly && !isUnconfirmed}
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
        <Route path="/standardization-preview" element={<StandardizationPreviewScreen />} />
        <Route path="/project-readiness-tools" element={<ProjectReadinessToolsIndexScreen />} />
        <Route path="/project-readiness-tools/overheating-tool" element={<OverheatingToolScreen />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
        <Route
          path="/project-readiness-tools/create-your-letters-of-assurance"
          element={<LettersOfAssuranceScreen />}
        />
        <Route
          path="/project-readiness-tools/check-step-code-requirements"
          element={<CheckStepCodeRequirementsScreen />}
        />
        <Route
          path="/project-readiness-tools/look-up-step-codes-requirements-for-your-project"
          element={<LookUpStepCodesRequirementsForYourProjectScreen />}
        />
        <Route path="/project-readiness-tools/check-digital-seals" element={<CheckDigitalSealsScreen />} />
        <Route path="/project-readiness-tools/pre-check" element={<PreCheckInfoScreen />} />
        <Route
          path="/onboarding-checklist-page-for-lg-adopting"
          element={<OnboardingChecklistPageForLgAdoptingScreen />}
        />
        <Route path="/confirmed" element={<EmailConfirmedScreen />} />
        <Route path="/welcome" element={<LandingScreen />} />
        <Route
          path="/early-access/requirement-templates/:requirementTemplateId"
          element={<EarlyAccessRequirementTemplateScreen />}
        />
        <Route
          path="/jurisdictions"
          element={
            loggedIn && isUnconfirmed ? (
              <RedirectScreen path="/" />
            ) : currentUser?.isSuperAdmin ? (
              <JurisdictionIndexScreen />
            ) : (
              <LimitedJurisdictionIndexScreen />
            )
          }
        />
        <Route
          path="/jurisdictions/:jurisdictionId/step-code-requirements"
          element={<JurisdictionStepCodeRequirementsScreen />}
        />
        <Route
          path="/jurisdictions/:jurisdictionId"
          element={loggedIn && isUnconfirmed ? <RedirectScreen path="/" /> : <JurisdictionScreen />}
        />
        <Route path="/part-3-step-code" element={<RedirectScreen path="start" />} />
        <Route path="/part-3-step-code/:stepCodeId" element={<RedirectScreen path="start" />} />
        <Route path="/part-3-step-code/:stepCodeId/:section" element={<Part3StepCodeForm />} />
        <Route path="/part-3-step-code/:section" element={<Part3StepCodeForm />} />
        <Route path="/part-9-step-code/new" element={<Part9StepCodeForm />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </>
  )
})
