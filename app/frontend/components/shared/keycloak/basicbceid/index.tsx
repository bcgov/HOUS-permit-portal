import { t } from "i18next"
import React from "react"
import { KeycloakInfoBlock } from "../info-block"

export function BasicBCeIDInfo() {
  return (
    <KeycloakInfoBlock
      title={t("auth.keycloakinfo.basic.title")}
      description={t("auth.keycloakinfo.basic.description")}
      bulletPoints={[t("auth.keycloakinfo.basic.homeownerAgent"), t("auth.keycloakinfo.basic.architectContractor")]}
      ctaText={t("auth.keycloakinfo.basic.register")}
      ctaLink={import.meta.env.VITE_BASIC_BCEID_REGISTRATION_URL}
    />
  )
}
