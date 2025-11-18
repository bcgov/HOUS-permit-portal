import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"

export const LoginMenuItem = () => {
  const { t } = useTranslation()

  return (
    <RouterLinkButton minW="120px" to="/login" variant="primary">
      {t("auth.login")}
    </RouterLinkButton>
  )
}
