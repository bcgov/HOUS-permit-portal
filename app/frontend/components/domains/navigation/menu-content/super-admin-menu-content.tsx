import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { LogoutButton } from "./logout-button"
import { MenuContentWrapper } from "./menu-content-wrapper"
import { EarlyAccessMenuItem } from "./menu-items/early-access-menu-item"
import { GiveFeedbackMenuItem } from "./menu-items/give-feedback-menu-item"
import { HelpMenuItem } from "./menu-items/help-menu-item"
import { HomeMenuItem } from "./menu-items/home-menu-item"
import { JurisdictionsMenuItem } from "./menu-items/jurisdictions-menu-item"
import { MyProfileMenuItem } from "./menu-items/my-profile-menu-item"
import { MyProjectsMenuItem } from "./menu-items/my-projects-menu-item"
import { PermitTemplateCatalogueMenuItem } from "./menu-items/permit-template-catalogue-menu-item"
import { ReportingMenuItem } from "./menu-items/reporting-menu-item"
import { RequirementsLibraryMenuItem } from "./menu-items/requirements-library-menu-item"
import { SuperAdminConfigurationMenuItem } from "./menu-items/super-admin-configuration-menu-item"
import { MenuSection } from "./menu-section"
import { UserInfoSection } from "./user-info-section"

export const SuperAdminMenuContent = observer(() => {
  const { t } = useTranslation()

  return (
    <MenuContentWrapper>
      <UserInfoSection />

      {/* Account section */}
      <MenuSection title={t("site.navMenu.sections.account")}>
        <HomeMenuItem />
        <MyProjectsMenuItem />
        <MyProfileMenuItem />
      </MenuSection>

      {/* Settings section */}
      <MenuSection title={t("site.navMenu.sections.settings")}>
        <SuperAdminConfigurationMenuItem />
        <JurisdictionsMenuItem />
      </MenuSection>

      {/* Permits section */}
      <MenuSection title={t("site.navMenu.sections.permits")}>
        <PermitTemplateCatalogueMenuItem />
        <RequirementsLibraryMenuItem />
        <EarlyAccessMenuItem />
        <ReportingMenuItem />
      </MenuSection>

      {/* Support section */}
      <MenuSection title={t("site.navMenu.sections.support")}>
        <GiveFeedbackMenuItem />
        <HelpMenuItem />
      </MenuSection>

      <MenuSection>
        <LogoutButton />
      </MenuSection>
    </MenuContentWrapper>
  )
})
