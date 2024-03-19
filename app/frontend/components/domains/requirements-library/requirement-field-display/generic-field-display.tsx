import { FormControl, FormControlProps, FormHelperText, FormLabel, FormLabelProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { TRequirementFieldDisplayProps } from "./index"

interface IGroupedFieldProps extends Omit<TRequirementFieldDisplayProps, "options"> {
  inputDisplay: JSX.Element
  containerProps?: Partial<FormControlProps>
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
  containerProps,
}: IGroupedFieldProps) {
  const { t } = useTranslation()
  return (
    <FormControl w={"100%"} isReadOnly {...containerProps}>
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
      {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
    </FormControl>
  )
})
