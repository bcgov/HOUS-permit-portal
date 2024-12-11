import { t } from "i18next"
import React from "react"
import { KeycloakInfoBlock } from "../info-block"

export function LgBusinessBCeIDInfo() {
  return (
    <KeycloakInfoBlock
      title={t("auth.keycloakinfo.business.title")}
      description={t("auth.keycloakinfo.business.lgDescription")}
      bulletPoints={[]}
      ctaText={t("auth.keycloakinfo.business.register")}
      ctaLink={import.meta.env.VITE_BUSINESS_BCEID_REGISTRATION_URL}
      infoLink={t("auth.keycloakinfo.business.seeMore")}
    />
  )
}
