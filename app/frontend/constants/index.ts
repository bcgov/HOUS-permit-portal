import { t } from "i18next"
import { IRequirementAttributes } from "../types/api-request"
import {
  EAutoComplianceType,
  EEnabledElectiveFieldReason,
  EEnergyStepCodeDependencyRequirementCode,
  EGovFeedbackResponseNoReason,
  ENumberUnit,
  ERequirementContactFieldItemType,
  ERequirementType,
} from "../types/enums"
import { IOption } from "../types/types"

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

export const requirementTypeToFormioType = {
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
export const datefnsTableDateFormat = "yyyy-MM-dd"

export const vancouverTimeZone = "America/Vancouver" // Vancouver time zone

export function getRequirementTypeLabel(
  requirementType: ERequirementType,
  matchesStepCodePackageRequirementCode?: boolean
) {
  let derivedTranslationKey: keyof typeof ERequirementType | "stepCodePackageFile"

  if (requirementType === ERequirementType.file && matchesStepCodePackageRequirementCode) {
    derivedTranslationKey = "stepCodePackageFile"
  } else {
    Object.entries(ERequirementType).forEach(([key, value]: [keyof typeof ERequirementType, ERequirementType]) => {
      if (value === requirementType) {
        derivedTranslationKey = key
      }
    })
  }

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

export function getEnergyStepCodeRequirementRequiredSchema(
  energyRequirementCode: EEnergyStepCodeDependencyRequirementCode
) {
  const requirementCodeToSchema: Record<EEnergyStepCodeDependencyRequirementCode, IRequirementAttributes> = {
    [EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod]: {
      requirementCode: EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod,
      inputType: ERequirementType.select,
      label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeMethod.label"),
      inputOptions: {
        valueOptions: [
          {
            label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeMethod.tool"),
            value: "tool",
          },
          {
            label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeMethod.file"),
            value: "file",
          },
        ],
      },
    },
    [EEnergyStepCodeDependencyRequirementCode.energyStepCodeToolPart9]: {
      requirementCode: EEnergyStepCodeDependencyRequirementCode.energyStepCodeToolPart9,
      inputType: ERequirementType.energyStepCode,
      label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeToolPart9.label"),
      inputOptions: {
        conditional: {
          // @ts-ignore
          eq: "tool",
          show: true,
          when: EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod,
        },
        energyStepCode: "part_9",
      },
    },
    [EEnergyStepCodeDependencyRequirementCode.energyStepCodeReportFile]: {
      requirementCode: EEnergyStepCodeDependencyRequirementCode.energyStepCodeReportFile,
      label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeReportFile.label"),
      inputType: ERequirementType.file,
      inputOptions: {
        conditional: {
          // @ts-ignore
          eq: "file",
          show: true,
          when: EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod,
        },
      },
    },
    [EEnergyStepCodeDependencyRequirementCode.energyStepCodeH2000File]: {
      requirementCode: EEnergyStepCodeDependencyRequirementCode.energyStepCodeH2000File,
      label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeH2000File.label"),
      inputType: ERequirementType.file,
      inputOptions: {
        conditional: {
          // @ts-ignore
          eq: "file",
          show: true,
          when: EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod,
        },
      },
    },
  }

  return requirementCodeToSchema[energyRequirementCode]
}

export const STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE = "architectural_drawing_file" as const

export const VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES = [
  EAutoComplianceType.internalValueExtractor,
  EAutoComplianceType.externalValueExtractor,
]

export const OPTIONS_MAPPER_AUTO_COMPLIANCE_TYPES = [EAutoComplianceType.externalOptionsMapper]
