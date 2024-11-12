import { Box, Button, Flex, HStack, Tag, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { Controller, useController, useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import {
  getEnergyStepCodeRequirementRequiredSchema,
  STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE,
} from "../../../../constants"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { IFormConditional, IRequirementAttributes } from "../../../../types/api-request"
import { EEnergyStepCodeDependencyRequirementCode, ENumberUnit, ERequirementType } from "../../../../types/enums"
import { IDenormalizedRequirementBlock } from "../../../../types/types"
import {
  isContactRequirement,
  isMultiOptionRequirement,
  isStepCodePackageFileRequirementCode,
} from "../../../../utils/utility-functions"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { FieldsSetupDrawer } from "../fields-setup-drawer"
import { RequirementFieldDisplay } from "../requirement-field-display"
import { RequirementFieldEdit } from "../requirement-field-edit"
import { FieldControlsHeader } from "./field-controls-header"
import { IRequirementBlockForm } from "./index"
import { ReorderList } from "./reorder-list"

const fieldContainerSharedProps = {
  w: "full",
  sx: {
    "& input": {
      maxW: "339px",
    },
  },
  mt: 7,
}

export const FieldsSetup = observer(function FieldsSetup({
  requirementBlock,
  isEditable = true,
}: {
  requirementBlock: IRequirementBlock | IDenormalizedRequirementBlock
  isEditable?: boolean
}) {
  const { t } = useTranslation()
  const { setValue, control, watch } = useFormContext<IRequirementBlockForm>()
  const { fields, append, remove, move } = useFieldArray<IRequirementBlockForm>({
    control,
    name: "requirementsAttributes",
  })
  const {
    field: { onChange: onDisplayNameChange, value: displayNameValue },
  } = useController({
    control,
    name: "displayName",
    rules: { required: true },
  })
  const watchedRequirements = watch("requirementsAttributes")

  const [requirementIdsToEdit, setRequirementIdsToEdit] = useState<Record<string, boolean>>({})

  const { isOpen: isInReorderMode, onToggle } = useDisclosure()

  const toggleRequirementToEdit = (requirementId: string) => {
    setRequirementIdsToEdit((pastState) => ({ ...pastState, [requirementId]: !pastState[requirementId] }))
  }

  const onUseRequirement = (
    requirementType: ERequirementType,
    _callBack: any,
    matchesStepCodePackageRequirementCode?: boolean
  ) => {
    if (requirementType !== ERequirementType.energyStepCode) {
      const isStepCodePackageFile = requirementType === ERequirementType.file && matchesStepCodePackageRequirementCode
      const defaults = {
        requirementCode: isStepCodePackageFile ? STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE : `dummy-${uuidv4()}`,
        id: `dummy-${uuidv4()}`,
        inputType: requirementType,
        label: [ERequirementType.generalContact, ERequirementType.professionalContact].includes(requirementType)
          ? t("requirementsLibrary.modals.defaultContactLabel")
          : undefined,
        ...(isMultiOptionRequirement(requirementType)
          ? {
              inputOptions: {
                valueOptions: [
                  { value: "Option 1", label: "Option 1" },
                  {
                    value: "Option 2",
                    label: "Option 2",
                  },
                  { value: "Option 3", label: "Option 3" },
                ],
              },
            }
          : {}),
      }
      append(defaults)

      return
    }

    // handle energy_step_code requirement as it's a special case where we have to add multiple other requirements
    // with additional defaults
    const energyStepCodeDependencyDefaults = Object.values(EEnergyStepCodeDependencyRequirementCode)
      .map((code) => getEnergyStepCodeRequirementRequiredSchema(code))
      .map((requirement) => {
        const energyRequirementInOriginalBlock = requirementBlock?.requirements.find(
          (r) => requirement.requirementCode === r.requirementCode
        )

        // we reuse the id of the original energy requirement dependency if it exists
        // this is to prevent duplicate label error from back-end, when removing then adding an energy_step_code requirement
        if (energyRequirementInOriginalBlock) {
          requirement.id = energyRequirementInOriginalBlock.id
        }
        return requirement
      })

    append(energyStepCodeDependencyDefaults)
  }

  const hasFields = fields.length > 0

  const disabledRequirementTypeOptions = (() => {
    const hasEnergyStepCodeRequirement = watchedRequirements.some(
      (r) => (r as IRequirementAttributes).inputType === ERequirementType.energyStepCode
    )
    const hasStepCodePackageFileRequirement = watchedRequirements.some((r) =>
      isStepCodePackageFileRequirementCode(r.requirementCode)
    )

    const disabledTypes: Array<{
      requirementType: ERequirementType
      isStepCodePackageFileRequirement?: boolean
    }> = []

    if (hasEnergyStepCodeRequirement) {
      disabledTypes.push({ requirementType: ERequirementType.energyStepCode })
    }

    if (hasStepCodePackageFileRequirement) {
      disabledTypes.push({ requirementType: ERequirementType.file, isStepCodePackageFileRequirement: true })
    }
    return disabledTypes
  })()

  function isRequirementInEditMode(id: string) {
    return !isInReorderMode && !!requirementIdsToEdit[id]
  }

  const onRemoveRequirement = (index: number) => {
    const requirement = watchedRequirements[index]

    if (!requirement) {
      return
    }

    const isEnergyStepCodeRequirement = requirement.inputType === ERequirementType.energyStepCode

    if (!isEnergyStepCodeRequirement) {
      remove(index)

      return
    }

    const stepCodeDependencyIndexes = watchedRequirements.reduce((acc, req, idx) => {
      const isEnergyStepCodeDependency = Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
        req.requirementCode as EEnergyStepCodeDependencyRequirementCode
      )

      if (isEnergyStepCodeDependency) {
        acc.push(idx)
      }

      return acc
    }, [])

    remove(stepCodeDependencyIndexes)
  }

  return (
    <Box position="relative" w="full" h="full">
      <Flex as={"section"} flexDir={"column"} flex={1} h={"full"} alignItems={"flex-start"}>
        <Text color={"text.primary"} fontSize={"sm"}>
          {t("requirementsLibrary.modals.configureFields")}
        </Text>

        <Box as={"section"} w={"full"} border={"1px solid"} borderColor={"border.light"} borderRadius={"lg"} mt={4}>
          <Flex
            py={2}
            px={6}
            w={"full"}
            background={"greys.grey04"}
            borderTopRadius="lg"
            borderBottom="1px solid"
            borderBottomColor="border.light"
            alignItems={"center"}
          >
            <EditableInputWithControls
              initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
              fontWeight={700}
              defaultValue={displayNameValue || ""}
              onSubmit={onDisplayNameChange}
              onCancel={onDisplayNameChange}
              color={R.isEmpty(displayNameValue) ? "text.link" : undefined}
              aria-label={"Edit Display Name"}
              flex={1}
            />
            <Button size={"xs"} variant={isInReorderMode ? "primary" : "secondary"} onClick={onToggle}>
              {t(isInReorderMode ? "ui.done" : "ui.reorder")}
            </Button>
          </Flex>
          <Box pb={8}>
            <Box px={3} mt={4} mb={3}>
              <Controller
                render={({ field: { value, onChange } }) => (
                  <EditorWithPreview
                    label={t("requirementsLibrary.modals.displayDescriptionLabel")}
                    htmlValue={value}
                    onChange={onChange}
                    initialTriggerText={t("requirementsLibrary.modals.addDescriptionTrigger")}
                    onRemove={(setEditMode) => {
                      setEditMode(false)
                      onChange("")
                    }}
                  />
                )}
                name={"displayDescription"}
                control={control}
              />
            </Box>
            {!hasFields && (
              <Flex w={"full"} justifyContent={"space-between"} px={6}>
                <Text>{t("requirementsLibrary.modals.noFormFieldsAdded")}</Text>
                <FieldsSetupDrawer
                  disabledRequirementTypeOptions={disabledRequirementTypeOptions}
                  onUse={onUseRequirement}
                />
              </Flex>
            )}
            {isInReorderMode ? (
              <ReorderList />
            ) : (
              <VStack w={"full"} alignItems={"flex-start"} spacing={2} px={3}>
                {fields.map((field, index) => {
                  const watchedHint = watch(`requirementsAttributes.${index}.hint`)
                  const watchedRequired = watch(`requirementsAttributes.${index}.required`)
                  const requirementType = (field as IRequirementAttributes).inputType
                  const watchedElective = watch(`requirementsAttributes.${index}.elective`)
                  const watchedConditional = watch(`requirementsAttributes.${index}.inputOptions.conditional`)
                  const watchedRequirementCode = watch(`requirementsAttributes.${index}.requirementCode`)
                  const watchedComputedCompliance = watch(
                    `requirementsAttributes.${index}.inputOptions.computedCompliance`
                  )
                  // Disables remove and conditional options for all energy_step_code dependency requirements except for the Energy Step Code requirement itself
                  const isStepCodeDependency = Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
                    watchedRequirementCode as EEnergyStepCodeDependencyRequirementCode
                  )
                  const disabledMenuOptions: ("remove" | "conditional")[] =
                    isStepCodeDependency || isStepCodePackageFileRequirementCode(watchedRequirementCode)
                      ? ["conditional"]
                      : []

                  // for step code dependency only the step_code requirement is removable and the other
                  // dependencies rely on it for removal
                  if (
                    isStepCodeDependency &&
                    watchedRequirementCode !== EEnergyStepCodeDependencyRequirementCode.energyStepCodeToolPart9
                  ) {
                    disabledMenuOptions.push("remove")
                  }

                  return (
                    <Box
                      key={field.id}
                      w={"full"}
                      borderRadius={"sm"}
                      _hover={{
                        bg: "theme.blueLight",
                        "& .requirement-edit-controls-container": {
                          ".requirement-edit-controls": {
                            display: "flex",
                          },
                        },
                      }}
                      _focus={{
                        bg: "theme.blueLight",
                        "& .requirement-edit-controls-container": {
                          flexFlow: "row",
                          ".requirement-edit-controls": {
                            visibility: "visible",
                          },
                        },
                      }}
                      tabIndex={0}
                      px={3}
                      pt={index !== 0 ? 1 : 0}
                      pb={5}
                      pos={"relative"}
                    >
                      <Box
                        {...fieldContainerSharedProps}
                        display={isRequirementInEditMode(field.id) ? "block" : "none"}
                      >
                        <RequirementFieldEdit<IRequirementBlockForm>
                          requirementType={requirementType}
                          editableLabelProps={{
                            controlProps: {
                              control: control,
                              name: `requirementsAttributes.${index}.label`,
                              rules: { required: true },
                            },
                            color: "text.link",
                            "aria-label": "Edit Label",
                          }}
                          editableHelperTextProps={{
                            controlProps: {
                              control: control,
                              name: `requirementsAttributes.${index}.hint`,
                            },
                          }}
                          isOptionalCheckboxProps={{
                            controlProps: {
                              control: control,
                              name: `requirementsAttributes.${index}.required`,
                              defaultValue: true,
                            },
                          }}
                          isElectiveCheckboxProps={{
                            controlProps: {
                              control: control,
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
                                  getOptionValue: (idx) =>
                                    watch(`requirementsAttributes.${index}.inputOptions.valueOptions.${idx}`),
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
                          requirementCode={watchedRequirementCode}
                        />
                      </Box>
                      <Box
                        className={"requirement-display"}
                        display={!isRequirementInEditMode(field.id) ? "block" : "none"}
                        {...fieldContainerSharedProps}
                      >
                        <RequirementFieldDisplay
                          matchesStepCodePackageRequirementCode={isStepCodePackageFileRequirementCode(
                            watchedRequirementCode
                          )}
                          requirementType={requirementType}
                          label={watch(`requirementsAttributes.${index}.label`)}
                          helperText={watchedHint}
                          unit={
                            requirementType === ERequirementType.number
                              ? watch(`requirementsAttributes.${index}.inputOptions.numberUnit`) ?? null
                              : undefined
                          }
                          options={watch(`requirementsAttributes.${index}.inputOptions.valueOptions`)?.map(
                            (option) => option.label
                          )}
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
                        requirementCode={watchedRequirementCode}
                        isRequirementInEditMode={isRequirementInEditMode(field.id)}
                        toggleRequirementToEdit={() => toggleRequirementToEdit(field.id)}
                        onRemove={() => onRemoveRequirement(index)}
                        elective={watchedElective}
                        conditional={watchedConditional as IFormConditional}
                        computedCompliance={watchedComputedCompliance}
                        requirementType={requirementType}
                        index={index}
                        disabledMenuOptions={disabledMenuOptions}
                      />
                    </Box>
                  )
                })}
                {hasFields && (
                  <FieldsSetupDrawer
                    disabledRequirementTypeOptions={disabledRequirementTypeOptions}
                    onUse={onUseRequirement}
                    defaultButtonProps={{
                      alignSelf: "flex-end",
                      mr: 3,
                    }}
                  />
                )}
              </VStack>
            )}
          </Box>
        </Box>
      </Flex>
      {!isEditable && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 255, 255, 0.6)"
          _hover={{ cursor: "not-allowed" }}
        >
          <Flex height="100%" justifyContent="center">
            <Tag h="fit-content" mt={50} bg="semantic.infoLight" border="1px solid" borderColor="semantic.info">
              <HStack spacing={2}>
                <Info />
                <Text>{t("requirementsLibrary.modals.cantEditHere")}</Text>
              </HStack>
            </Tag>
          </Flex>
        </Box>
      )}
    </Box>
  )
})
