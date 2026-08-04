import { Box, Button, HStack, Text, Tooltip } from "@chakra-ui/react"
import { Info, Pencil } from "@phosphor-icons/react"
import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { TEditableRichTextProps } from "./types"

export type TEditableHelperTextProps<TFieldValues extends FieldValues> = TEditableRichTextProps<TFieldValues>

export function EditableHelperText<TFieldValues extends FieldValues>({
  controlProps,
  defaultValue,
  usesBankQuestion = false,
  isQuestionBankDefault = false,
}: TEditableHelperTextProps<TFieldValues>) {
  const {
    field: { onChange, value },
  } = useController(controlProps)
  const { t } = useTranslation()
  const isUsingBankDefault = usesBankQuestion && value == null
  const htmlValue = (isUsingBankDefault ? defaultValue : value) ?? ""

  return (
    <Box>
      {isQuestionBankDefault && (
        <HStack spacing={1} mb={1} color={"text.secondary"}>
          <Text fontSize={"xs"}>{t("questionBank.modals.defaultHelpText")}</Text>
          <Tooltip label={t("questionBank.modals.defaultContentExplanation")}>
            <Box as={"span"}>
              <Info size={14} aria-label={t("questionBank.modals.defaultContentInfo")} />
            </Box>
          </Tooltip>
        </HStack>
      )}
      {usesBankQuestion && (
        <Text fontSize={"xs"} mb={1} color={"text.secondary"}>
          {t(
            isUsingBankDefault
              ? "requirementsLibrary.modals.usingSharedDefault"
              : "requirementsLibrary.modals.customizedForBlock"
          )}
        </Text>
      )}
      <EditorWithPreview
        label={t(
          isQuestionBankDefault
            ? "questionBank.modals.defaultHelpTextLabel"
            : "requirementsLibrary.modals.addHelpTextLabel"
        )}
        htmlValue={htmlValue}
        onChange={onChange}
        onRemove={
          usesBankQuestion && !isUsingBankDefault
            ? (setEditMode) => {
                onChange(null)
                setEditMode(false)
              }
            : undefined
        }
        removeText={t("requirementsLibrary.modals.useSharedDefault")}
        renderInitialTrigger={(buttonProps) => (
          <Button variant={"link"} rightIcon={<Pencil size={14} />} fontSize={"md"} {...buttonProps}>
            {t(
              isQuestionBankDefault
                ? "questionBank.modals.addDefaultHelpText"
                : usesBankQuestion
                  ? "requirementsLibrary.modals.addCustomHelpText"
                  : "requirementsLibrary.modals.addHelpText"
            )}
          </Button>
        )}
        editText={t(
          isQuestionBankDefault
            ? "questionBank.modals.editDefaultHelpText"
            : isUsingBankDefault
              ? "requirementsLibrary.modals.customizeHelpText"
              : "requirementsLibrary.modals.editHelpTextLabel"
        )}
        editTextButtonProps={{ rightIcon: <Pencil size={14} />, fontSize: "md" }}
        containerProps={{ p: 0 }}
      />
    </Box>
  )
}
