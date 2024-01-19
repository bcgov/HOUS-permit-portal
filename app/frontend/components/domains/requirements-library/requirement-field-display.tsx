import {
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
import { ENumberUnit } from "../../../types/types"

const defaultLabelProps: Partial<FormLabelProps> = {
  fontWeight: 700,
}

type TRequirementProps = {
  labelProps?: Partial<FormLabelProps>
  label?: string
  options?: string[]
  helperText?: string
  unit?: ENumberUnit
}

const helperTextStyles = {
  color: "text.secondary",
}

const defaultOptions = ["Option", "Option"]

const requirementsComponentMap = {
  [ERequirementType.text]({ label, helperText, labelProps }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.shortText")}
        </FormLabel>
        <Input bg={"white"} />
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.address]({ label, helperText, labelProps }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.address")}
        </FormLabel>
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

  [ERequirementType.date]({ label, helperText, labelProps }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.date")}
        </FormLabel>
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

  [ERequirementType.number]({ label, helperText, unit, labelProps }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.number")}
        </FormLabel>
        <InputGroup w={"130px"}>
          <InputRightElement mr={2}>{unit === "noUnit" ? null : unit ?? "unit"}</InputRightElement>
          <Input bg={"white"} />
        </InputGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.textArea]({ label, helperText, labelProps }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.textArea")}
        </FormLabel>
        <Textarea bg={"white"} _hover={{ borderColor: "border.base" }} />
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.radio]({ label, options = defaultOptions, helperText, labelProps }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.radio")}
        </FormLabel>
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

  [ERequirementType.multiSelectCheckbox]({
    label,
    helperText,
    options = defaultOptions,
    labelProps,
  }: TRequirementProps) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...defaultLabelProps} {...labelProps}>
          {label ?? t("requirementsLibrary.requirementTypeLabels.multiSelectCheckbox")}
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

type TProps = { requirementType: ERequirementType } & TRequirementProps

export function hasRequirementFieldDisplayComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}

export const RequirementFieldDisplay = observer(function RequirementFieldDisplay({ requirementType, ...rest }: TProps) {
  return requirementsComponentMap[requirementType]?.(rest) ?? null
})
