import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ENumberUnit, ERequirementType } from "../../../../types/enums"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
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
    name: "requirementBlockRequirementsAttributes",
  })
  const [requirementToEdit, setRequirementToEdit] = useState<string | null>()

  const onUseRequirement = (requirementType: ERequirementType) => {
    append({
      requirementAttributes: {
        inputType: requirementType,
      },
    })
  }

  const watchedDisplayName = watch("displayName")

  const hasFields = fields.length > 0

  function isRequirementInEditMode(id: string) {
    return requirementToEdit === id
  }

  return (
    <Flex as={"section"} flexDir={"column"} flex={1} h={"full"} alignItems={"flex-start"}>
      <Text color={"text.primary"} fontSize={"sm"}>
        {t("requirementsLibrary.modals.configureFields")}
      </Text>

      <Box as={"section"} w={"full"} border={"1px solid"} borderColor={"border.light"} borderRadius={"sm"} mt={4}>
        <Flex py={3} px={6} w={"full"} background={"greys.grey04"}>
          <EditableInputWithControls
            initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
            fontWeight={700}
            editableInputProps={{
              ...register("displayName", { required: true }),
              "aria-label": "Edit Display Name",
            }}
            color={R.isEmpty(watchedDisplayName) ? "text.link" : undefined}
            aria-label={"Edit Display Name"}
          />
        </Flex>
        <Box py={8}>
          {!hasFields && (
            <Flex w={"full"} justifyContent={"space-between"} px={6}>
              <Text>{t("requirementsLibrary.modals.noFormFieldsAdded")}</Text>
              <FieldsSetupDrawer onUse={onUseRequirement} />
            </Flex>
          )}
          <VStack w={"full"} alignItems={"flex-start"} spacing={2} px={3}>
            {fields.map((field, index) => {
              const watchedHint = watch(`requirementBlockRequirementsAttributes.${index}.requirementAttributes.hint`)
              const requirementType = field.requirementAttributes.inputType
              return (
                <Box
                  key={field.id}
                  w={"full"}
                  borderRadius={"sm"}
                  _hover={{
                    bg: "theme.blueLight",
                    "& .requirement-edit-btn": {
                      visibility: isRequirementInEditMode(field.id) ? "hidden" : "visible",
                    },
                  }}
                  _focus={{
                    bg: "theme.blueLight",
                    "& .requirement-edit-btn": {
                      visibility: isRequirementInEditMode(field.id) ? "hidden" : "visible",
                    },
                  }}
                  tabIndex={0}
                  px={3}
                  pt={1}
                  pb={5}
                  pos={"relative"}
                  onMouseLeave={() => {
                    isRequirementInEditMode(field.id) && setRequirementToEdit(null)
                  }}
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
                        color: "text.link",
                        editableInputProps: {
                          ...register(`requirementBlockRequirementsAttributes.${index}.requirementAttributes.label`, {
                            required: true,
                            value: t("requirementsLibrary.modals.defaultRequirementLabel"),
                          }),
                          "aria-label": "Edit Label",
                          w: "calc(100% - 60px)",
                        },
                      }}
                      editableHelperTextProps={{
                        getStateBasedEditableProps: (isEditing) =>
                          isEditing
                            ? {}
                            : {
                                color: !!watchedHint ? "text.secondary" : "text.link",
                                textDecoration: watchedHint ? undefined : "underline",
                              },
                        editableInputProps: {
                          ...register(`requirementBlockRequirementsAttributes.${index}.requirementAttributes.hint`),
                          "aria-label": "Edit Helper Text",
                        },
                      }}
                      checkboxProps={{
                        controlProps: {
                          control: control,
                          rules: {
                            onChange: (e) =>
                              setValue(
                                `requirementBlockRequirementsAttributes.${index}.requirementAttributes.required`,
                                !e.target.value
                              ),
                          },
                          name: `requirementBlockRequirementsAttributes.${index}.requirementAttributes.required`,
                          // @ts-ignore
                          defaultValue: true,
                        },
                      }}
                      unitSelectProps={
                        requirementType === ERequirementType.number
                          ? {
                              controlProps: {
                                control: control,

                                name: `requirementBlockRequirementsAttributes.${index}.requirementAttributes.inputOptions.numberUnit`,
                                // @ts-ignore
                                defaultValue: ENumberUnit.noUnit,
                              },
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
                      label={watch(`requirementBlockRequirementsAttributes.${index}.requirementAttributes.label`)}
                      helperText={watchedHint}
                      labelProps={{
                        w: "calc(100% - 60px)",
                      }}
                      unit={
                        requirementType === ERequirementType.number
                          ? watch(
                              `requirementBlockRequirementsAttributes.${index}.requirementAttributes.inputOptions.numberUnit`
                            ) ?? null
                          : undefined
                      }
                    />
                  </Box>
                  <Button
                    className={"requirement-edit-btn"}
                    variant={"primary"}
                    pos={"absolute"}
                    right={0}
                    top={0}
                    size={"sm"}
                    visibility={"hidden"}
                    onClick={() => {
                      setRequirementToEdit(field.id)
                    }}
                  >
                    {t("ui.edit")}
                  </Button>
                  {isRequirementInEditMode(field.id) && (
                    <OptionsMenu
                      menuButtonProps={{
                        pos: "absolute",
                        right: 0,
                        top: 0,
                      }}
                      onRemove={() => remove(index)}
                    />
                  )}
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
