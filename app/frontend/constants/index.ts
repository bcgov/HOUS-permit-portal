import { t } from "i18next"
import { IRequirementAttributes } from "../types/api-request"
import {
  EArchitecturalDrawingDependencyRequirementCode,
  EAutoComplianceType,
  EEnabledElectiveFieldReason,
  EEnergyStepCodeDependencyRequirementCode,
  EEnergyStepCodePart3DependencyRequirementCode,
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
export const datefnsTableDateFormat = "MMM-dd-yyyy"
export const datefnsTableDateTimeFormat = "MMM dd, yyyy HH:mm"

export const vancouverTimeZone = "America/Vancouver" // Vancouver time zone

export function getRequirementTypeLabel(requirementType: ERequirementType): string {
  let derivedTranslationKey: keyof typeof ERequirementType

  Object.entries(ERequirementType).forEach(([key, value]: [keyof typeof ERequirementType, ERequirementType]) => {
    if (value === requirementType) {
      derivedTranslationKey = key
    }
  })

  // @ts-ignore
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
      inputType: ERequirementType.radio,
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
      inputType: ERequirementType.energyStepCodePart9,
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

export function getEnergyStepCodePart3RequirementRequiredSchema(
  energyRequirementCode: EEnergyStepCodePart3DependencyRequirementCode
) {
  const requirementCodeToSchema: Record<EEnergyStepCodePart3DependencyRequirementCode, IRequirementAttributes> = {
    [EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeMethod]: {
      requirementCode: EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeMethod,
      inputType: ERequirementType.radio,
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
    [EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeToolPart3]: {
      requirementCode: EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeToolPart3,
      inputType: ERequirementType.energyStepCodePart3,
      label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeToolPart3.label"),
      inputOptions: {
        conditional: {
          // @ts-ignore
          eq: "tool",
          show: true,
          when: EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeMethod,
        },
        energyStepCode: "part_3",
      },
    },
    [EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeReportFile]: {
      requirementCode: EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeReportFile,
      label: t("requirementsLibrary.modals.stepCodeDependencies.energyStepCodeReportFile.label"),
      inputType: ERequirementType.file,
      inputOptions: {
        conditional: {
          // @ts-ignore
          eq: "file",
          show: true,
          when: EEnergyStepCodePart3DependencyRequirementCode.energyStepCodeMethod,
        },
      },
    },
  }

  return requirementCodeToSchema[energyRequirementCode]
}

export function getArchitecturalDrawingRequirementRequiredSchema(
  code: EArchitecturalDrawingDependencyRequirementCode
): IRequirementAttributes {
  const requirementCodeToSchema: Record<EArchitecturalDrawingDependencyRequirementCode, IRequirementAttributes> = {
    [EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingMethod]: {
      requirementCode: EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingMethod,
      inputType: ERequirementType.radio,
      label: t("requirementsLibrary.modals.architecturalDrawing.dependencies.method.label"),
      inputOptions: {
        valueOptions: [
          {
            label: t("requirementsLibrary.modals.architecturalDrawing.dependencies.method.tool"),
            value: "tool",
          },
          {
            label: t("requirementsLibrary.modals.architecturalDrawing.dependencies.method.file"),
            value: "file",
          },
        ],
      },
    },
    [EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingTool]: {
      requirementCode: EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingTool,
      inputType: ERequirementType.architecturalDrawing,
      label: t("requirementsLibrary.modals.architecturalDrawing.dependencies.tool.label"),
      inputOptions: {
        conditional: {
          when: EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingMethod,
          eq: "tool",
          show: true,
        },
      },
    },
    [EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingFile]: {
      requirementCode: EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingFile,
      inputType: ERequirementType.file,
      label: t("requirementsLibrary.modals.architecturalDrawing.dependencies.file.label"),
      inputOptions: {
        conditional: {
          when: EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingMethod,
          eq: "file",
          show: true,
        },
        multiple: true,
      },
    },
  }

  return requirementCodeToSchema[code]
}

export const VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES = [
  EAutoComplianceType.internalValueExtractor,
  EAutoComplianceType.externalValueExtractor,
]

export const OPTIONS_MAPPER_AUTO_COMPLIANCE_TYPES = [EAutoComplianceType.externalOptionsMapper]
