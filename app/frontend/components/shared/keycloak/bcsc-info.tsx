import { t } from "i18next"
import React from "react"
import { KeycloakInfoBlock } from "./info-block"

export function BCSCInfo() {
  return (
    <KeycloakInfoBlock
      title={t("auth.keycloakinfo.bcsc.title")}
      description={t("auth.keycloakinfo.useIf")}
      bulletPoints={[t("auth.keycloakinfo.bcsc.canadianResident")]}
      ctaText={t("auth.keycloakinfo.bcsc.register")}
      ctaLink={import.meta.env.VITE_BCSC_REGISTRATION_URL}
    />
  )
}
