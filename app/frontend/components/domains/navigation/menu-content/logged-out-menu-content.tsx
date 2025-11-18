import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { MenuContentWrapper } from "./menu-content-wrapper"
import { GiveFeedbackMenuItem } from "./menu-items/give-feedback-menu-item"
import { HelpMenuItem } from "./menu-items/help-menu-item"
import { LoginMenuItem } from "./menu-items/login-menu-item"
import { MenuSection } from "./menu-section"

export const LoggedOutMenuContent = observer(() => {
  const { t } = useTranslation()
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore

  return (
    <MenuContentWrapper>
      {/* Account section */}
      <MenuSection title={t("site.navMenu.sections.account")}>
        <LoginMenuItem />
      </MenuSection>

      {/* Support section */}
      <MenuSection title={t("site.navMenu.sections.support")}>
        <GiveFeedbackMenuItem />
        <HelpMenuItem />
      </MenuSection>
    </MenuContentWrapper>
  )
})
