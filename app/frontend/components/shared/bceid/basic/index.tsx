import { t } from "i18next"
import React from "react"
import { BCeIDInfoBlock } from "../info-block"

export function BasicBCeIDInfo() {
  return (
    <BCeIDInfoBlock
      title={t("auth.bceidInfo.basic.title")}
      description={t("auth.bceidInfo.basic.description")}
      bulletPoints={[t("auth.bceidInfo.basic.homeownerAgent"), t("auth.bceidInfo.basic.architectContractor")]}
      ctaText={t("auth.bceidInfo.basic.register")}
      ctaLink={import.meta.env.VITE_BASIC_BCEID_REGISTRATION_URL}
    />
  )
}
