import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { LogoutButton } from "./logout-button"
import { MenuContentWrapper } from "./menu-content-wrapper"
import { GiveFeedbackMenuItem } from "./menu-items/give-feedback-menu-item"
import { HelpMenuItem } from "./menu-items/help-menu-item"
import { MyProfileMenuItem } from "./menu-items/my-profile-menu-item"
import { MyProjectsMenuItem } from "./menu-items/my-projects-menu-item"
import { MenuSection } from "./menu-section"
import { UserInfoSection } from "./user-info-section"

export const SubmitterMenuContent = observer(() => {
  const { t } = useTranslation()

  return (
    <MenuContentWrapper>
      <UserInfoSection />

      {/* Account section */}
      <MenuSection title={t("site.navMenu.sections.account")}>
        <MyProjectsMenuItem />
        <MyProfileMenuItem />
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
