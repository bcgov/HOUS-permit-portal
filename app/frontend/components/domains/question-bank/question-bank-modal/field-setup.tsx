import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TQuestionUsageBlock } from "../../../../models/requirement-question"
import { IRequirementAttributes } from "../../../../types/api-request"
import { ERequirementType } from "../../../../types/enums"
import { isMultiOptionRequirement } from "../../../../utils/utility-functions"
import { FieldsSetupDrawer } from "../../requirements-library/fields-setup-drawer"
import { RequirementFieldRow } from "../../requirements-library/requirements-block-modal/requirement-field-row"
import { IRequirementQuestionForm } from "./index"
import { QuestionUsageSection } from "./question-usage-section"

// Package field types are not supported as bank questions — keep them in blocks only.
const EXCLUDED_BANK_REQUIREMENT_TYPES = [
  ERequirementType.energyStepCodePart9,
  ERequirementType.energyStepCodePart3,
  ERequirementType.architecturalDrawing,
]

export const FieldSetup = observer(function FieldSetup({
  requirementBlocks,
  isPersisted,
}: {
  requirementBlocks?: TQuestionUsageBlock[]
  isPersisted: boolean
}) {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<IRequirementQuestionForm>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirementsAttributes",
  })

  const [requirementIdToEdit, setRequirementIdToEdit] = useState<string | undefined>()
  const watchedRequirements = watch("requirementsAttributes")
  const hasFields = fields.length > 0
  const linkedBlocks = requirementBlocks ?? []

  const toggleRequirementToEdit = (requirementId: string) => {
    setRequirementIdToEdit((pastRequirementId) => (pastRequirementId === requirementId ? undefined : requirementId))
  }

  const isRequirementInEditMode = (id: string) => requirementIdToEdit === id

  const onUseRequirement = (requirementType: ERequirementType, closeDrawer?: () => void) => {
    if (fields.length > 0) {
      remove(0)
    }

    append({
      inputType: requirementType,
      label: [ERequirementType.generalContact, ERequirementType.professionalContact].includes(requirementType)
        ? t("requirementsLibrary.modals.defaultContactLabel")
        : "",
      hint: "",
      required: true,
      elective: false,
      requirementCode: "",
      inputOptions: isMultiOptionRequirement(requirementType)
        ? {
            valueOptions: [
              { value: "Option 1", label: "Option 1" },
              { value: "Option 2", label: "Option 2" },
            ],
          }
        : {},
    })
    closeDrawer?.()
  }

  const onRemoveRequirement = (index: number) => {
    remove(index)
    setRequirementIdToEdit(undefined)
  }

  return (
    <Flex as={"section"} flexDir={"column"} flex={1} h={"full"} alignItems={"flex-start"} minW={0}>
      <Text color={"text.primary"} fontSize={"sm"}>
        {t("questionBank.modals.configureFields")}
      </Text>

      <Box as={"section"} w={"full"} border={"1px solid"} borderColor={"border.light"} borderRadius={"lg"} mt={4}>
        <Box pb={8}>
          {!hasFields && (
            <Flex w={"full"} justifyContent={"space-between"} px={6} pt={6}>
              <Text>{t("questionBank.modals.noFormFieldsAdded")}</Text>
              <FieldsSetupDrawer onUse={onUseRequirement} excludedRequirementTypes={EXCLUDED_BANK_REQUIREMENT_TYPES} />
            </Flex>
          )}
          {hasFields && (
            <VStack w={"full"} alignItems={"flex-start"} spacing={2} px={3} pt={4}>
              {fields.map((field, index) => (
                <RequirementFieldRow
                  key={field.id}
                  index={index}
                  field={(watchedRequirements?.[index] ?? field) as IRequirementAttributes}
                  isEditing={isRequirementInEditMode(field.id)}
                  toggleEdit={() => toggleRequirementToEdit(field.id)}
                  onRemove={() => onRemoveRequirement(index)}
                  hideConditional
                  hidePlacementOptions
                  hidePlacementConfiguration
                  disableRemove={isPersisted}
                />
              ))}
            </VStack>
          )}
        </Box>
      </Box>

      <QuestionUsageSection linkedBlocks={linkedBlocks} />
    </Flex>
  )
})
