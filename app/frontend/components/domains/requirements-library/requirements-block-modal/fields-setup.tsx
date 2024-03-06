import { Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { Controller, useController, useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementsAttribute } from "../../../../types/api-request"
import { ENumberUnit, ERequirementType } from "../../../../types/enums"
import { isMultiOptionRequirement } from "../../../../utils/utility-functions"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { FieldsSetupDrawer } from "../fields-setup-drawer"
import { RequirementFieldDisplay } from "../requirement-field-display"
import { RequirementFieldEdit } from "../requirement-field-edit"
import { OptionsMenu } from "../requirement-field-edit/options-menu"
import { IRequirementBlockForm } from "./index"

export const FieldsSetup = observer(function FieldsSetup() {
  const { t } = useTranslation()
  const { setValue, control, register, watch } = useFormContext<IRequirementBlockForm>()
  const { fields, append, remove } = useFieldArray<IRequirementBlockForm>({
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

  const [requirementIdsToEdit, setRequirementIdsToEdit] = useState<Record<string, boolean>>({})

  const toggleRequirementToEdit = (requirementId: string) => {
    setRequirementIdsToEdit((pastState) => ({ ...pastState, [requirementId]: !pastState[requirementId] }))
  }

  const onUseRequirement = (requirementType: ERequirementType) => {
    append({
      inputType: requirementType,
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
    })
  }

  const hasFields = fields.length > 0

  function isRequirementInEditMode(id: string) {
    return !!requirementIdsToEdit[id]
  }

  return (
    <Flex as={"section"} flexDir={"column"} flex={1} h={"full"} alignItems={"flex-start"}>
      <Text color={"text.primary"} fontSize={"sm"}>
        {t("requirementsLibrary.modals.configureFields")}
      </Text>

      <Box as={"section"} w={"full"} border={"1px solid"} borderColor={"border.light"} borderRadius={"lg"} mt={4}>
        <Flex py={3} px={6} w={"full"} background={"greys.grey04"}>
          <EditableInputWithControls
            initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
            fontWeight={700}
            defaultValue={displayNameValue || ""}
            onSubmit={onDisplayNameChange}
            onCancel={onDisplayNameChange}
            color={R.isEmpty(displayNameValue) ? "text.link" : undefined}
            aria-label={"Edit Display Name"}
          />
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
              <FieldsSetupDrawer onUse={onUseRequirement} />
            </Flex>
          )}
          <VStack w={"full"} alignItems={"flex-start"} spacing={2} px={3}>
            {fields.map((field, index) => {
              const watchedHint = watch(`requirementsAttributes.${index}.hint`)
              const requirementType = (field as IRequirementsAttribute).inputType
              return (
                <Box
                  key={field.id}
                  w={"full"}
                  borderRadius={"sm"}
                  _hover={{
                    bg: "theme.blueLight",
                    "& .requirement-edit-btn": {
                      visibility: "visible",
                    },
                  }}
                  _focus={{
                    bg: "theme.blueLight",
                    "& .requirement-edit-btn": {
                      visibility: "visible",
                    },
                  }}
                  tabIndex={0}
                  px={3}
                  pt={index !== 0 ? 1 : 0}
                  pb={5}
                  pos={"relative"}
                >
                  <Box
                    w={"full"}
                    sx={{
                      "& input": {
                        maxW: "339px",
                      },
                    }}
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
                        w: `calc(100% - 220px)`,
                        "aria-label": "Edit Label",
                      }}
                      editableHelperTextProps={{
                        getStateBasedEditableProps: (isEditing) =>
                          isEditing
                            ? {}
                            : {
                                color: !!watchedHint ? "text.secondary" : "text.link",
                                textDecoration: watchedHint ? undefined : "underline",
                              },
                        controlProps: {
                          control: control,
                          name: `requirementsAttributes.${index}.hint`,
                        },
                        "aria-label": "Edit Helper Text",
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
                          // @ts-ignore
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
                    />
                  </Box>
                  <Box
                    w={"full"}
                    sx={{
                      "& input": {
                        maxW: "339px",
                      },
                    }}
                    display={!isRequirementInEditMode(field.id) ? "block" : "none"}
                  >
                    <RequirementFieldDisplay
                      requirementType={requirementType}
                      label={watch(`requirementsAttributes.${index}.label`)}
                      helperText={watchedHint}
                      labelProps={{
                        w: `calc(100% - 60px})`,
                      }}
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
                    />
                  </Box>
                  <HStack pos={"absolute"} right={0} top={0} spacing={4}>
                    {isRequirementInEditMode(field.id) && (
                      <OptionsMenu
                        menuButtonProps={{
                          size: "sm",
                        }}
                        onRemove={() => remove(index)}
                      />
                    )}
                    <Button
                      className={"requirement-edit-btn"}
                      visibility={isRequirementInEditMode(field.id) ? "visible" : "hidden"}
                      variant={"primary"}
                      size={"sm"}
                      onClick={() => {
                        toggleRequirementToEdit(field.id)
                      }}
                    >
                      {t(isRequirementInEditMode(field.id) ? "ui.done" : "ui.edit")}
                    </Button>
                  </HStack>
                </Box>
              )
            })}
            {hasFields && (
              <FieldsSetupDrawer
                onUse={onUseRequirement}
                defaultButtonProps={{
                  alignSelf: "flex-end",
                  mr: 3,
                }}
              />
            )}
          </VStack>
        </Box>
      </Box>
    </Flex>
  )
})
