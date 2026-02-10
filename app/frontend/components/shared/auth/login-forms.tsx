import { Button } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { OMNIAUTH_PROVIDERS } from "../../../models/user"

export const IdirLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.idir} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.idirLogin")}
      </Button>
    </form>
  )
}
export const BcscLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.bcsc} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.bcscLogin")}
      </Button>
    </form>
  )
}
export const BceidLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.bceid} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.bceidLogin")}
      </Button>
    </form>
  )
}
