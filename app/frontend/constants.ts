import { t } from "i18next"
import {
  EEnabledElectiveFieldReason,
  EGovFeedbackResponseNoReason,
  ENumberUnit,
  ERequirementContactFieldItemType,
  ERequirementType,
} from "./types/enums"
import { IOption } from "./types/types"

export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// this needs to be in a function other wise the t function does not work
export const getUnitOptionLabel = (unit?: ENumberUnit) => {
  const unitToLabel = {
    mm: t("requirementsLibrary.unitLabels.option.mm"),
    cm: t("requirementsLibrary.unitLabels.option.cm"),
    m: t("requirementsLibrary.unitLabels.option.m"),
    in: t("requirementsLibrary.unitLabels.option.in"),
    ft: t("requirementsLibrary.unitLabels.option.ft"),
    mi: t("requirementsLibrary.unitLabels.option.mi"),
    sqm: t("requirementsLibrary.unitLabels.option.sqm"),
    sqft: t("requirementsLibrary.unitLabels.option.sqft"),
    cad: t("requirementsLibrary.unitLabels.option.cad"),
  }

  return unit === undefined ? t("requirementsLibrary.unitLabels.option.noUnit") : unitToLabel[unit]
}

export const requirementTypeToFomionType = {
  [ERequirementType.file]: "simplefile",
} as const

export const getUnitDisplayLabel = (unit?: ENumberUnit) => {
  const unitToLabel = {
    mm: t("requirementsLibrary.unitLabels.display.mm"),
    cm: t("requirementsLibrary.unitLabels.display.cm"),
    m: t("requirementsLibrary.unitLabels.display.m"),
    in: t("requirementsLibrary.unitLabels.display.in"),
    ft: t("requirementsLibrary.unitLabels.display.ft"),
    mi: t("requirementsLibrary.unitLabels.display.mi"),
    sqm: t("requirementsLibrary.unitLabels.display.sqm"),
    sqft: t("requirementsLibrary.unitLabels.display.sqft"),
    cad: t("requirementsLibrary.unitLabels.display.cad"),
  }

  return unit === undefined ? t("requirementsLibrary.unitLabels.display.noUnit") : unitToLabel[unit]
}

export const unitGroups: { [key: string]: ENumberUnit[] } = {
  metric: [ENumberUnit.mm, ENumberUnit.cm, ENumberUnit.m, ENumberUnit.sqm, ENumberUnit.cad],
  imperial: [ENumberUnit.in, ENumberUnit.ft, ENumberUnit.mi, ENumberUnit.sqft],
}

export const datefnsAppDateFormat = "yyyy/MM/dd"

export const vancouverTimeZone = "America/Vancouver" // Vancouver time zone

export function getRequirementTypeLabel(requirementType: ERequirementType) {
  let derivedTranslationKey: keyof typeof ERequirementType

  Object.entries(ERequirementType).forEach(([key, value]: [keyof typeof ERequirementType, ERequirementType]) => {
    if (value === requirementType) {
      derivedTranslationKey = key
    }
  })

  return t(`requirementsLibrary.requirementTypeLabels.${derivedTranslationKey}`)
}

export function getRequirementContactFieldItemLabel(contactFieldItemType: ERequirementContactFieldItemType) {
  return t(`requirementsLibrary.contactFieldItemLabels.${contactFieldItemType}`)
}

export function getGovFeedbackResponseNoReasonOptions(): IOption<EGovFeedbackResponseNoReason>[] {
  return Object.entries(EGovFeedbackResponseNoReason).map(
    ([key, value]: [keyof typeof EGovFeedbackResponseNoReason, EGovFeedbackResponseNoReason]) => ({
      value: value,
      label: t(`site.govFeedbackResponseNoReasons.${key}`),
    })
  )
}

export function getEnabledElectiveReasonOptions(): IOption<EEnabledElectiveFieldReason>[] {
  return Object.values(EEnabledElectiveFieldReason).map((reason) => {
    return {
      label: t(`digitalBuildingPermits.edit.requirementBlockSidebar.reasonLabels.${reason}`),
      value: reason,
    }
  })
}
