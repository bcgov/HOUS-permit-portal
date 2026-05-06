import { Field, FormControlProps, FormLabelProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { isTipTapEmpty } from "../../../../utils/utility-functions"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { TRequirementFieldDisplayProps } from "./index"

interface IGroupedFieldProps extends Omit<TRequirementFieldDisplayProps, "options"> {
  inputDisplay: JSX.Element
  required?: boolean
  containerProps?: Partial<FormControlProps>
  editorContainerProps?: Partial<FormControlProps>
}

const defaultLabelProps: Partial<FormLabelProps> = {
  color: "text.primary",
}

const helperTextStyles = {
  color: "text.secondary",
}

export const GenericFieldDisplay = observer(function GroupedFieldDisplay({
  inputDisplay,
  label,
  labelProps,
  helperText,
  instructions,
  showAddLabelIndicator,
  requirementType,
  containerProps,
  required,
  editorContainerProps,
}: IGroupedFieldProps) {
  const { t } = useTranslation()
  return (
    <Field.Root w={"100%"} readOnly {...containerProps}>
      <Field.Label
        pointerEvents="none"
        {...defaultLabelProps}
        {...(labelProps as FormLabelProps)}
        color={!label && showAddLabelIndicator ? "error" : undefined}
        css={{
          "& :after": {
            content: `"${t("ui.optional")}"`,
            ml: 1.5,
            display: !required ? "inline" : "none",
          },
        }}
      >
        {label ??
          (showAddLabelIndicator
            ? `${t("requirementsLibrary.modals.addLabel")} *`
            : getRequirementTypeLabel(requirementType))}
      </Field.Label>
      {!isTipTapEmpty(instructions) && (
        <EditorWithPreview
          label={t("requirementsLibrary.modals.addInstructionsLabel")}
          htmlValue={instructions}
          containerProps={{ p: 0, ...helperTextStyles, ...editorContainerProps }}
          isReadOnly
        />
      )}
      {inputDisplay}
      {!isTipTapEmpty(helperText) && (
        <EditorWithPreview
          label={t("requirementsLibrary.modals.addHelpTextLabel")}
          htmlValue={helperText}
          containerProps={{ p: 0, ...helperTextStyles, ...editorContainerProps }}
          isReadOnly
        />
      )}
    </Field.Root>
  )
})
