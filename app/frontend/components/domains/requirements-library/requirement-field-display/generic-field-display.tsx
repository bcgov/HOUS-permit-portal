import { FormControl, FormLabel, FormLabelProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { isQuillEmpty } from "../../../../utils/utility-functions"
import { EditorWithPreview } from "../../../shared/editor/custom-extensions/editor-with-preview"
import { TRequirementFieldDisplayProps } from "./index"

interface IGroupedFieldProps extends Omit<TRequirementFieldDisplayProps, "options"> {
  inputDisplay: JSX.Element
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
  showAddLabelIndicator,
  requirementType,
}: IGroupedFieldProps) {
  const { t } = useTranslation()
  return (
    <FormControl w={"100%"} isReadOnly>
      <FormLabel
        {...defaultLabelProps}
        {...(labelProps as FormLabelProps)}
        color={!label && showAddLabelIndicator ? "error" : undefined}
      >
        {label ??
          (showAddLabelIndicator
            ? `${t("requirementsLibrary.modals.addLabel")} *`
            : getRequirementTypeLabel(requirementType))}
      </FormLabel>
      {inputDisplay}
      {!isQuillEmpty(helperText) && (
        <EditorWithPreview
          label={t("requirementsLibrary.modals.addHelpTextLabel")}
          htmlValue={helperText}
          containerProps={{ p: 0, ...helperTextStyles }}
          isReadOnly
        />
      )}
    </FormControl>
  )
})
