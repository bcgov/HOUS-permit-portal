import { Button } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"

export const LogoutButton = observer(() => {
  const { t } = useTranslation()
  const { sessionStore } = useMst()
  const { logout } = sessionStore

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button variant="tertiary" onClick={handleLogout} ml={-1}>
      {t("auth.logout")}
    </Button>
  )
})
