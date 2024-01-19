import {
  Box,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  FormLabelProps,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ERequirementType } from "../../../types/enums"
import { EditableInputWithControls, IEditableControlProps } from "../../shared/editable-input-with-controls"

const labelProps: Partial<FormLabelProps> = {
  fontWeight: 700,
}

type TRequirementEditProps = {
  label?: string
  options?: string[]
  helperText?: string
  editableLabelProps?: IEditableControlProps
}

const helperTextStyles = {
  color: "border.base",
}

const defaultOptions = ["Option", "Option"]

const requirementsComponentMap = {
  [ERequirementType.text]({ label, helperText, editableLabelProps }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <Box>
        <EditableInputWithControls {...editableLabelProps} />
        <Input bg={"white"} />
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </Box>
    )
  },

  [ERequirementType.address]({ label, helperText }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{label || t("requirementsLibrary.requirementTypeLabels.address")}</FormLabel>
        <InputGroup>
          <InputLeftElement>
            <FontAwesomeIcon icon={faLocationDot} />
          </InputLeftElement>
          <Input bg={"white"} />
        </InputGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.date]({ label, helperText }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{label || t("requirementsLibrary.requirementTypeLabels.date")}</FormLabel>
        <InputGroup w={"166px"}>
          <InputLeftElement>
            <FontAwesomeIcon icon={faCalendar} />
          </InputLeftElement>
          <Input bg={"white"} />
        </InputGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.number]({ label, helperText }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{label || t("requirementsLibrary.requirementTypeLabels.number")}</FormLabel>
        <InputGroup w={"130px"}>
          <InputRightElement mr={2}>unit</InputRightElement>
          <Input bg={"white"} />
        </InputGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.textArea]({ label, helperText }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{label || t("requirementsLibrary.requirementTypeLabels.textArea")}</FormLabel>
        <Textarea bg={"white"} _hover={{ borderColor: "border.base" }} />
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.radio]({ label, options = defaultOptions, helperText }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{label || t("requirementsLibrary.requirementTypeLabels.radio")}</FormLabel>
        <RadioGroup defaultValue="1">
          <Stack>
            {options.map((option) => (
              <Radio value={option}>{option}</Radio>
            ))}
          </Stack>
        </RadioGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.multiSelectCheckbox]({ label, helperText, options = defaultOptions }: TRequirementEditProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>
          {label || t("requirementsLibrary.requirementTypeLabels.multiSelectCheckbox")}
        </FormLabel>
        <CheckboxGroup>
          <Stack>
            {options.map((option) => (
              <Checkbox value={option}>{option}</Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },
}

type TProps = { requirementType: ERequirementType } & TRequirementEditProps

export function hasRequirementFieldEditComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}

export const RequirementFieldEdit = observer(function RequirementFieldDisplay({ requirementType, ...rest }: TProps) {
  return requirementsComponentMap[requirementType]?.(rest) ?? null
})
