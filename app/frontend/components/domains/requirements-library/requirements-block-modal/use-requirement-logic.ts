import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import {
  getEnergyStepCodePart3RequirementRequiredSchema,
  getEnergyStepCodeRequirementRequiredSchema,
} from "../../../../constants"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { IRequirementAttributes } from "../../../../types/api-request"
import {
  EEnergyStepCodeDependencyRequirementCode,
  EEnergyStepCodePart3DependencyRequirementCode,
  ERequirementType,
} from "../../../../types/enums"
import { IDenormalizedRequirementBlock } from "../../../../types/types"
import {
  isEnergyStepCodeDependencyRequirementCode,
  isMultiOptionRequirement,
} from "../../../../utils/utility-functions"

interface UseRequirementLogicProps {
  append: (value: any) => void
  remove: (index: number | number[]) => void
  watchedRequirements: IRequirementAttributes[]
  requirementBlock: IRequirementBlock | IDenormalizedRequirementBlock
}

export const useRequirementLogic = ({
  append,
  remove,
  watchedRequirements,
  requirementBlock,
}: UseRequirementLogicProps) => {
  const { t } = useTranslation()
  const onUseRequirement = (requirementType: ERequirementType) => {
    // Architectural drawing is a single requirement with pre-configured defaults
    if (requirementType === ERequirementType.architecturalDrawing) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - deeply nested i18n key causes "excessively deep" type error
      const archLabel: string = t("requirementsLibrary.modals.architecturalDrawing.dependencies.file.label")
      const defaults = {
        requirementCode: `dummy-${uuidv4()}`,
        id: `dummy-${uuidv4()}`,
        inputType: ERequirementType.architecturalDrawing,
        label: archLabel,
        hint: "",
        required: true,
        elective: false,
        inputOptions: {
          multiple: true,
          computedCompliance: {
            module: "DigitalSealValidator",
            trigger: "on_save",
            valueOn: "compliance_data",
          },
        },
      }
      append(defaults)
      return
    }

    // Energy step code types use a dependency map pattern (multiple related requirements)
    if (
      requirementType !== ERequirementType.energyStepCodePart9 &&
      requirementType !== ERequirementType.energyStepCodePart3
    ) {
      const defaults = {
        requirementCode: `dummy-${uuidv4()}`,
        id: `dummy-${uuidv4()}`,
        inputType: requirementType,
        label: [ERequirementType.generalContact, ERequirementType.professionalContact].includes(requirementType)
          ? t("requirementsLibrary.modals.defaultContactLabel")
          : "",
        hint: "",
        required: true,
        elective: false,
        inputOptions: isMultiOptionRequirement(requirementType)
          ? {
              valueOptions: [
                { value: "Option 1", label: "Option 1" },
                {
                  value: "Option 2",
                  label: "Option 2",
                },
                { value: "Option 3", label: "Option 3" },
              ],
            }
          : {},
      }
      append(defaults)

      return
    }

    const dependencyMap: {
      [key in ERequirementType]?: {
        codes: EEnergyStepCodeDependencyRequirementCode[] | EEnergyStepCodePart3DependencyRequirementCode[]
        schemaGetter: (
          code: EEnergyStepCodeDependencyRequirementCode | EEnergyStepCodePart3DependencyRequirementCode
        ) => IRequirementAttributes
      }
    } = {
      [ERequirementType.energyStepCodePart9]: {
        codes: Object.values(EEnergyStepCodeDependencyRequirementCode),
        schemaGetter: (code) =>
          getEnergyStepCodeRequirementRequiredSchema(code as EEnergyStepCodeDependencyRequirementCode),
      },
      [ERequirementType.energyStepCodePart3]: {
        codes: Object.values(EEnergyStepCodePart3DependencyRequirementCode),
        schemaGetter: (code) =>
          getEnergyStepCodePart3RequirementRequiredSchema(code as EEnergyStepCodePart3DependencyRequirementCode),
      },
    }

    const dependencyConfig = dependencyMap[requirementType]

    if (dependencyConfig) {
      const dependencyDefaults = dependencyConfig.codes
        .map((code) => dependencyConfig.schemaGetter(code))
        .map((requirement) => {
          const existingRequirement = requirementBlock?.requirements.find(
            (r) => requirement.requirementCode === r.requirementCode
          )

          if (existingRequirement) {
            requirement.id = existingRequirement.id
          }

          return requirement
        })

      append(dependencyDefaults)
    }
  }

  const onRemoveRequirement = (index: number) => {
    const requirement = watchedRequirements[index]

    if (!requirement) {
      return
    }

    const isEnergyStepCodeRequirement = isEnergyStepCodeDependencyRequirementCode(
      requirement.requirementCode,
      requirement.inputType
    )

    // Architectural drawing is a single requirement, just remove by index
    if (!isEnergyStepCodeRequirement) {
      remove(index)
      return
    }

    const stepCodeDependencyIndexes = watchedRequirements.reduce((acc: number[], req, idx) => {
      // Remove all energy step code dependencies, regardless of whether they are Part 9 or Part 3
      // Since only one type (Part 9 OR Part 3) is allowed at a time, this is safe.
      if (isEnergyStepCodeDependencyRequirementCode(req.requirementCode)) {
        acc.push(idx)
      }

      return acc
    }, [])

    remove(stepCodeDependencyIndexes)
  }

  const disabledRequirementTypeOptions = (() => {
    const hasEnergyStepCodeRequirement = watchedRequirements?.some(
      (r) => r.inputType === ERequirementType.energyStepCodePart9
    )
    const hasEnergyStepCodePart3Requirement = watchedRequirements?.some(
      (r) => r.inputType === ERequirementType.energyStepCodePart3
    )
    const hasArchitecturalRequirement = watchedRequirements?.some(
      (r) => r.inputType === ERequirementType.architecturalDrawing
    )
    const disabledTypes: Array<{
      requirementType: ERequirementType
    }> = []

    if (hasEnergyStepCodeRequirement) {
      disabledTypes.push({ requirementType: ERequirementType.energyStepCodePart9 })
    }

    if (hasEnergyStepCodePart3Requirement) {
      disabledTypes.push({ requirementType: ERequirementType.energyStepCodePart3 })
    }
    if (hasArchitecturalRequirement) {
      disabledTypes.push({ requirementType: ERequirementType.architecturalDrawing })
    }
    return disabledTypes
  })()

  return {
    onUseRequirement,
    onRemoveRequirement,
    disabledRequirementTypeOptions,
  }
}
