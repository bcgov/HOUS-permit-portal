import { Button } from "@chakra-ui/react"
import { Pencil } from "@phosphor-icons/react"
import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { IControlProps } from "./types"

export type TEditableInstructionsTextProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues>

export function EditableInstructionsText<TFieldValues extends FieldValues>({
  controlProps,
}: TEditableInstructionsTextProps<TFieldValues>) {
  const {
    field: { onChange, value },
  } = useController({ ...controlProps })
  const { t } = useTranslation()
  return (
    <EditorWithPreview
      label={t("requirementsLibrary.modals.addInstructionsLabel")}
      htmlValue={value}
      onChange={onChange}
      renderInitialTrigger={(buttonProps) => (
        <Button variant={"link"} rightIcon={<Pencil size={14} />} fontSize={"md"} {...buttonProps}>
          {t("requirementsLibrary.modals.addInstructions")}
        </Button>
      )}
      editText={t("requirementsLibrary.modals.editInstructionsLabel")}
      editTextButtonProps={{ rightIcon: <Pencil size={14} />, fontSize: "md" }}
      containerProps={{ p: 0 }}
    />
  )
}
