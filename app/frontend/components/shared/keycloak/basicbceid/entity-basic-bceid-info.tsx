import { t } from "i18next"
import React from "react"
import { KeycloakInfoBlock } from "../info-block"

export function EntityBasicBCeIDInfo() {
  return (
    <KeycloakInfoBlock
      title={t("auth.keycloakinfo.basic.title")}
      description={t("auth.keycloakinfo.useIf")}
      bulletPoints={[t("auth.keycloakinfo.basic.repOrg")]}
      ctaText={t("auth.keycloakinfo.basic.register")}
      ctaLink={import.meta.env.VITE_BASIC_BCEID_REGISTRATION_URL}
    />
  )
}
