import { FormControl, FormControlProps, FormLabel, FormLabelProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { isQuillEmpty } from "../../../../utils/utility-functions"
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
  matchesStepCodePackageRequirementCode,
  inputDisplay,
  label,
  labelProps,
  helperText,
  showAddLabelIndicator,
  requirementType,
  containerProps,
  required,
  editorContainerProps,
}: IGroupedFieldProps) {
  const { t } = useTranslation()
  const isRequired = label && required
  return (
    <FormControl w={"100%"} isReadOnly {...containerProps}>
      <FormLabel
        {...defaultLabelProps}
        {...(labelProps as FormLabelProps)}
        color={!label && showAddLabelIndicator ? "error" : undefined}
        sx={{
          ":after": {
            content: `"${t("ui.optional")}"`,
            ml: 1.5,
            display: !isRequired ? "inline" : "none",
          },
        }}
      >
        {label ??
          (showAddLabelIndicator
            ? `${t("requirementsLibrary.modals.addLabel")} *`
            : getRequirementTypeLabel(requirementType, matchesStepCodePackageRequirementCode))}
      </FormLabel>

      {inputDisplay}
      {!isQuillEmpty(helperText) && (
        <EditorWithPreview
          label={t("requirementsLibrary.modals.addHelpTextLabel")}
          htmlValue={helperText}
          containerProps={{ p: 0, ...helperTextStyles, ...editorContainerProps }}
          isReadOnly
        />
      )}
    </FormControl>
  )
})
