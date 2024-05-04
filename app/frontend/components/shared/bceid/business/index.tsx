import { t } from "i18next"
import React from "react"
import { BCeIDInfoBlock } from "../info-block"

export function BusinessBCeIDInfo() {
  return (
    <BCeIDInfoBlock
      title={t("auth.bceidInfo.business.title")}
      description={t("auth.bceidInfo.business.description")}
      bulletPoints={[
        t("auth.bceidInfo.business.localGov"),
        t("auth.bceidInfo.business.company"),
        t("auth.bceidInfo.business.nonProfit"),
        t("auth.bceidInfo.business.education"),
      ]}
      ctaText={t("auth.bceidInfo.business.register")}
      ctaLink={import.meta.env.VITE_BUSINESS_BCEID_REGISTRATION_URL}
      infoLink={t("auth.bceidInfo.business.seeMore")}
    />
  )
}
