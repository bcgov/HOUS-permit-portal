import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { LogoutButton } from "./logout-button"
import { MenuContentWrapper } from "./menu-content-wrapper"
import { ConfigurationManagementMenuItem } from "./menu-items/configuration-management-menu-item"
import { GiveFeedbackMenuItem } from "./menu-items/give-feedback-menu-item"
import { HelpMenuItem } from "./menu-items/help-menu-item"
import { HomeMenuItem } from "./menu-items/home-menu-item"
import { MyProfileMenuItem } from "./menu-items/my-profile-menu-item"
import { MyProjectsMenuItem } from "./menu-items/my-projects-menu-item"
import { SandboxMenuItem } from "./menu-items/sandbox-menu-item"
import { MenuSection } from "./menu-section"
import { UserInfoSection } from "./user-info-section"

export const TechnicalSupportMenuContent = observer(() => {
  const { t } = useTranslation()
  const { sandboxStore } = useMst()
  const { isSandboxActive } = sandboxStore

  return (
    <MenuContentWrapper>
      <UserInfoSection />

      {/* Account section */}
      <MenuSection title={t("site.navMenu.sections.account")}>
        <HomeMenuItem />
        {isSandboxActive && <MyProjectsMenuItem />}
        <MyProfileMenuItem />
      </MenuSection>

      {/* Settings section */}
      <MenuSection title={t("site.navMenu.sections.settings")}>
        <ConfigurationManagementMenuItem />
      </MenuSection>

      {/* Support section */}
      <MenuSection title={t("site.navMenu.sections.support")}>
        <GiveFeedbackMenuItem />
        <HelpMenuItem />
      </MenuSection>

      <MenuSection>
        <SandboxMenuItem />
        <LogoutButton />
      </MenuSection>
    </MenuContentWrapper>
  )
})
