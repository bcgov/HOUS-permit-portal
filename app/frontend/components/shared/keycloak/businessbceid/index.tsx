import { t } from "i18next"
import React from "react"
import { KeycloakInfoBlock } from "../info-block"

export function BusinessBCeIDInfo() {
  return (
    <KeycloakInfoBlock
      title={t("auth.keycloakinfo.business.title")}
      description={t("auth.keycloakinfo.business.description")}
      bulletPoints={[
        t("auth.keycloakinfo.business.localGov"),
        t("auth.keycloakinfo.business.company"),
        t("auth.keycloakinfo.business.nonProfit"),
        t("auth.keycloakinfo.business.education"),
      ]}
      ctaText={t("auth.keycloakinfo.business.register")}
      ctaLink={import.meta.env.VITE_BUSINESS_BCEID_REGISTRATION_URL}
      infoLink={t("auth.keycloakinfo.business.seeMore")}
    />
  )
}
