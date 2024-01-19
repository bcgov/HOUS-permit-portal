import { t } from "i18next"
import { ENumberUnit } from "./types/types"

export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// this needs to be in a function other wise the t function does not work
export const getUnitOptionLabel = (unit: ENumberUnit) => {
  const unitToLabel = {
    noUnit: t("requirementsLibrary.unitLabels.option.noUnit"),
    mm: t("requirementsLibrary.unitLabels.option.mm"),
    cm: t("requirementsLibrary.unitLabels.option.cm"),
    m: t("requirementsLibrary.unitLabels.option.m"),
    in: t("requirementsLibrary.unitLabels.option.in"),
    ft: t("requirementsLibrary.unitLabels.option.ft"),
    mi: t("requirementsLibrary.unitLabels.option.mi"),
  }

  return unitToLabel[unit]
}

export const getUnitDisplayLabel = (unit: ENumberUnit) => {
  const unitToLabel = {
    noUnit: t("requirementsLibrary.unitLabels.display.noUnit"),
    mm: t("requirementsLibrary.unitLabels.display.mm"),
    cm: t("requirementsLibrary.unitLabels.display.cm"),
    m: t("requirementsLibrary.unitLabels.display.m"),
    in: t("requirementsLibrary.unitLabels.display.in"),
    ft: t("requirementsLibrary.unitLabels.display.ft"),
    mi: t("requirementsLibrary.unitLabels.display.mi"),
  }

  return unitToLabel[unit]
}

export const unitGroups: { [key: string]: ENumberUnit[] } = {
  none: [ENumberUnit.noUnit],
  metric: [ENumberUnit.mm, ENumberUnit.cm, ENumberUnit.m],
  imperial: [ENumberUnit.in, ENumberUnit.ft, ENumberUnit.mi],
}
