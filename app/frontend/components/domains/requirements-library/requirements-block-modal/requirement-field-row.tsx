import { Box } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IFormConditional, IRequirementAttributes } from "../../../../types/api-request"
import {
  EArchitecturalDrawingDependencyRequirementCode,
  EEnergyStepCodeDependencyRequirementCode,
  ENumberUnit,
  ERequirementType,
} from "../../../../types/enums"
import {
  isArchitecturalDrawingDependencyRequirementCode,
  isContactRequirement,
  isMultiOptionRequirement,
} from "../../../../utils/utility-functions"
import { RequirementFieldDisplay } from "../requirement-field-display"
import { RequirementFieldEdit } from "../requirement-field-edit"
import { FieldControlsHeader } from "./field-controls-header"
import { IRequirementBlockForm } from "./index"

interface RequirementFieldRowProps {
  index: number
  field: IRequirementAttributes
  isEditing: boolean
  toggleEdit: () => void
  onRemove: () => void
}

const fieldContainerSharedProps = {
  w: "full",
  sx: {
    "& input": {
      maxW: "339px",
    },
  },
  mt: 7,
}

const getRequirementFieldState = (requirementCode: string | undefined) => {
  // Disables remove and conditional options for all energy_step_code dependency requirements except for the Energy Step Code requirement itself
  const isStepCodeDependency = Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
    requirementCode as EEnergyStepCodeDependencyRequirementCode
  )
  const isArchitecturalRequirement = isArchitecturalDrawingDependencyRequirementCode(requirementCode)

  const disabledMenuOptions: ("remove" | "conditional")[] =
    isStepCodeDependency || isArchitecturalRequirement ? ["conditional"] : []

  // for step code dependency only the step_code requirement is removable and the other
  // dependencies rely on it for removal
  if (isStepCodeDependency && requirementCode !== EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod) {
    disabledMenuOptions.push("remove")
  }

  if (
    isArchitecturalRequirement &&
    requirementCode !== EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingMethod
  ) {
    disabledMenuOptions.push("remove")
  }

  const showEditControls =
    !isStepCodeDependency && !isArchitecturalRequirement
      ? true
      : requirementCode === EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod ||
        requirementCode === EArchitecturalDrawingDependencyRequirementCode.architecturalDrawingMethod

  return { disabledMenuOptions, showEditControls }
}

export const RequirementFieldRow = ({ index, field, isEditing, toggleEdit, onRemove }: RequirementFieldRowProps) => {
  const { t } = useTranslation()
  const { setValue, control, watch } = useFormContext<IRequirementBlockForm>()

  const watchedHint = watch(`requirementsAttributes.${index}.hint`)
  const watchedRequired = watch(`requirementsAttributes.${index}.required`)
  const requirementType = field.inputType
  const watchedElective = watch(`requirementsAttributes.${index}.elective`)
  const watchedConditional = watch(`requirementsAttributes.${index}.inputOptions.conditional`)
  const watchedRequirementCode = watch(`requirementsAttributes.${index}.requirementCode`)
  const watchedComputedCompliance = watch(`requirementsAttributes.${index}.inputOptions.computedCompliance`)

  const { disabledMenuOptions, showEditControls } = getRequirementFieldState(watchedRequirementCode)

  return (
    <Box
      w={"full"}
      borderRadius={"sm"}
      _hover={{
        bg: "theme.blueLight",
        "& .requirement-edit-controls-container": {
          ".requirement-edit-controls": {
            display: showEditControls ? "flex" : "none",
          },
        },
      }}
      _focus={{
        bg: "theme.blueLight",
        "& .requirement-edit-controls-container": {
          flexFlow: "row",
          ".requirement-edit-controls": {
            visibility: showEditControls ? "visible" : "hidden",
          },
        },
      }}
      tabIndex={0}
      px={3}
      pt={index === 0 ? 0 : 1}
      pb={5}
      pos={"relative"}
    >
      <Box {...fieldContainerSharedProps} display={isEditing ? "block" : "none"}>
        <RequirementFieldEdit<IRequirementBlockForm>
          requirementType={requirementType}
          label={watch(`requirementsAttributes.${index}.label`)}
          editableLabelProps={{
            controlProps: {
              control,
              name: `requirementsAttributes.${index}.label`,
              rules: { required: true },
            },
            color: "text.link",
            // @ts-ignore
            "aria-label": t("requirementsLibrary.modals.fieldLabel"),
          }}
          editableHelperTextProps={{
            controlProps: { control, name: `requirementsAttributes.${index}.hint` },
          }}
          editableInstructionsTextProps={{
            controlProps: { control, name: `requirementsAttributes.${index}.instructions` },
          }}
          isOptionalCheckboxProps={{
            controlProps: {
              control,
              name: `requirementsAttributes.${index}.required`,
              defaultValue: true,
            },
          }}
          isElectiveCheckboxProps={{
            controlProps: {
              control,
              name: `requirementsAttributes.${index}.elective`,
            },
          }}
          unitSelectProps={
            requirementType === ERequirementType.number
              ? {
                  controlProps: {
                    control: control,

                    name: `requirementsAttributes.${index}.inputOptions.numberUnit`,
                    // @ts-ignore
                    defaultValue: ENumberUnit.noUnit,
                  },
                }
              : undefined
          }
          multiOptionProps={
            isMultiOptionRequirement(requirementType)
              ? {
                  useFieldArrayProps: {
                    control,
                    name: `requirementsAttributes.${index}.inputOptions.valueOptions`,
                  },
                  onOptionValueChange: (optionNIndex, optionValue) => {
                    setValue(
                      `requirementsAttributes.${index}.inputOptions.valueOptions.${optionNIndex}.value`,
                      optionValue
                    )
                    setValue(
                      `requirementsAttributes.${index}.inputOptions.valueOptions.${optionNIndex}.label`,
                      optionValue
                    )
                  },
                  getOptionValue: (idx) => watch(`requirementsAttributes.${index}.inputOptions.valueOptions.${idx}`),
                }
              : undefined
          }
          canAddMultipleContactProps={
            isContactRequirement(requirementType)
              ? {
                  controlProps: {
                    control: control,
                    name: `requirementsAttributes.${index}.inputOptions.canAddMultipleContacts`,
                  },
                }
              : undefined
          }
          isMultipleFilesCheckboxProps={
            requirementType === ERequirementType.file
              ? {
                  controlProps: {
                    control: control,
                    name: `requirementsAttributes.${index}.inputOptions.multiple` as any,
                  },
                }
              : undefined
          }
          requirementCode={watchedRequirementCode}
        />
      </Box>
      <Box className={"requirement-display"} display={isEditing ? "none" : "block"} {...fieldContainerSharedProps}>
        <RequirementFieldDisplay
          requirementType={requirementType}
          label={watch(`requirementsAttributes.${index}.label`)}
          helperText={watchedHint}
          inputOptions={watch(`requirementsAttributes.${index}.inputOptions`)}
          unit={
            requirementType === ERequirementType.number
              ? (watch(`requirementsAttributes.${index}.inputOptions.numberUnit`) ?? null)
              : undefined
          }
          options={watch(`requirementsAttributes.${index}.inputOptions.valueOptions`)?.map((option) => option.label)}
          selectProps={{
            maxW: "339px",
          }}
          addMultipleContactProps={{
            shouldRender: true,
            formControlProps: { isDisabled: true },
            switchProps: {
              isChecked: !!watch(`requirementsAttributes.${index}.inputOptions.canAddMultipleContacts`),
            },
          }}
          required={watchedRequired}
          showAddLabelIndicator
        />
      </Box>
      <FieldControlsHeader
        requirementCode={watchedRequirementCode as ERequirementType}
        isRequirementInEditMode={isEditing}
        toggleRequirementToEdit={showEditControls ? toggleEdit : undefined}
        onRemove={onRemove}
        elective={watchedElective}
        conditional={watchedConditional as IFormConditional}
        computedCompliance={watchedComputedCompliance}
        requirementType={requirementType}
        index={index}
        disabledMenuOptions={disabledMenuOptions}
      />
    </Box>
  )
}
