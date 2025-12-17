import { Box, Button, Flex, HStack, Tag, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { Controller, useController, useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { IRequirementAttributes } from "../../../../types/api-request"
import { EFlashMessageStatus } from "../../../../types/enums"
import { IDenormalizedRequirementBlock } from "../../../../types/types"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { FieldsSetupDrawer } from "../fields-setup-drawer"
import { IRequirementBlockForm } from "./index"
import { ReorderList } from "./reorder-list"
import { RequirementFieldRow } from "./requirement-field-row"
import { useRequirementLogic } from "./use-requirement-logic"

export const FieldsSetup = observer(function FieldsSetup({
  requirementBlock,
  isEditable = true,
}: {
  requirementBlock: IRequirementBlock | IDenormalizedRequirementBlock
  isEditable?: boolean
}) {
  const { t } = useTranslation()
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<IRequirementBlockForm>()
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
  const watchedRequirements = watch("requirementsAttributes")

  const [requirementIdsToEdit, setRequirementIdsToEdit] = useState<Record<string, boolean>>({})

  const { isOpen: isInReorderMode, onToggle } = useDisclosure()

  const toggleRequirementToEdit = (requirementId: string) => {
    setRequirementIdsToEdit((pastState) => ({ ...pastState, [requirementId]: !pastState[requirementId] }))
  }

  const { onUseRequirement, onRemoveRequirement, disabledRequirementTypeOptions } = useRequirementLogic({
    append,
    remove,
    watchedRequirements: watchedRequirements as IRequirementAttributes[],
    requirementBlock,
  })

  const hasFields = fields.length > 0

  function isRequirementInEditMode(id: string) {
    return !isInReorderMode && !!requirementIdsToEdit[id]
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
              onChange={onDisplayNameChange}
              color={R.isEmpty(displayNameValue) ? "text.link" : undefined}
              aria-label={"Edit Display Name"}
              flex={1}
            />
            <Button size={"xs"} variant={isInReorderMode ? "primary" : "secondary"} onClick={onToggle}>
              {t(isInReorderMode ? "ui.done" : "ui.reorder")}
            </Button>
          </Flex>
          {errors.displayName && (
            <CustomMessageBox
              m={6}
              status={EFlashMessageStatus.error}
              description={t(`requirementsLibrary.modals.displayNameError`)}
            />
          )}
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
                  return (
                    <RequirementFieldRow
                      key={field.id}
                      index={index}
                      field={field}
                      isEditing={isRequirementInEditMode(field.id)}
                      toggleEdit={() => toggleRequirementToEdit(field.id)}
                      onRemove={() => onRemoveRequirement(index)}
                    />
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
            <Tag h="fit-content" mt={30} bg="semantic.infoLight" border="1px solid" borderColor="semantic.info">
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
