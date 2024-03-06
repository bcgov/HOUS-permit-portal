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
  Select,
  SelectProps,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { CalendarBlank, MapPin } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../constants"
import { ENumberUnit, ERequirementType } from "../../../types/enums"

const defaultLabelProps: Partial<FormLabelProps> = {
  color: "text.primary",
}

type TRequirementFieldDisplayProps = {
  labelProps?: Partial<FormLabelProps>
  label?: string
  options?: string[]
  helperText?: string
  unit?: ENumberUnit | null
  selectProps?: Partial<SelectProps>
  requirementType: ERequirementType
  showAddLabelIndicator?: boolean
}

interface IGroupedFieldProps extends Omit<TRequirementFieldDisplayProps, "options"> {
  inputDisplay: JSX.Element
}

const helperTextStyles = {
  color: "text.secondary",
}

const defaultOptions = ["Option", "Option"]

const requirementsComponentMap = {
  [ERequirementType.text](props: TRequirementFieldDisplayProps) {
    return <GenericFieldDisplay inputDisplay={<Input bg={"white"} />} {...props} />
  },

  [ERequirementType.phone](props: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <i className="fa fa-phone"></i>
            </InputLeftElement>
            <Input bg={"white"} />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.email](props: TRequirementFieldDisplayProps) {
    const { t } = useTranslation()

    return (
      <GenericFieldDisplay
        inputDisplay={
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <i className="fa fa-envelope"></i>
            </InputLeftElement>
            <Input bg={"white"} />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.address](props: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <InputGroup>
            <InputLeftElement>
              <MapPin />
            </InputLeftElement>
            <Input bg={"white"} />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.date](props: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <InputGroup w={"166px"}>
            <InputLeftElement>
              <CalendarBlank />
            </InputLeftElement>
            <Input bg={"white"} />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.number]({ unit, ...genericieldDisplayProps }: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <InputGroup w={"130px"}>
            <InputRightElement mr={2}>{unit === undefined ? "unit" : unit}</InputRightElement>
            <Input bg={"white"} />
          </InputGroup>
        }
        {...genericieldDisplayProps}
      />
    )
  },

  [ERequirementType.textArea](props: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={<Textarea bg={"white"} _hover={{ borderColor: "border.base" }} />}
        {...props}
      />
    )
  },

  [ERequirementType.radio]({ options = defaultOptions, ...genericDisplayProps }: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <RadioGroup defaultValue="1">
            <Stack>
              {options.map((option, index) => (
                <Radio key={index} value={option}>
                  {option}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        }
        {...genericDisplayProps}
      />
    )
  },

  [ERequirementType.checkbox]({ options = defaultOptions, ...genericDisplayProps }: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <CheckboxGroup>
            <Stack>
              {options.map((option, index) => (
                <Checkbox key={index} value={option}>
                  {option}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        }
        {...genericDisplayProps}
      />
    )
  },

  [ERequirementType.multiOptionSelect]({
    options = defaultOptions,
    ...genericDisplayProps
  }: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <CheckboxGroup>
            <Stack>
              {options.map((option, index) => (
                <Checkbox key={index} value={option}>
                  {option}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        }
        {...genericDisplayProps}
      />
    )
  },

  [ERequirementType.select]({
    selectProps,
    options = defaultOptions,
    ...genericDisplayProps
  }: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <Select placeholder={"Select"} color={"greys.grey01"} value={""} isReadOnly {...selectProps}>
            {options.map((option, index) => (
              <option key={index} value={option} style={{ width: "100%" }}>
                {option}
              </option>
            ))}
          </Select>
        }
        {...genericDisplayProps}
      />
    )
  },

  [ERequirementType.file](props: TRequirementFieldDisplayProps) {
    return <GenericFieldDisplay inputDisplay={<i className="fa fa-cloud-upload"></i>} {...props} />
  },

  [ERequirementType.energyStepCode](props: TRequirementFieldDisplayProps) {
    return <GenericFieldDisplay inputDisplay={<i className="fa fa-bolt"></i>} {...props} />
  },
}

export function hasRequirementFieldDisplayComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}

export const RequirementFieldDisplay = observer(function RequirementFieldDisplay(props: TRequirementFieldDisplayProps) {
  return requirementsComponentMap[props.requirementType]?.(props) ?? null
})

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
    <FormControl isReadOnly>
      <FormLabel {...defaultLabelProps} {...labelProps} color={!label && showAddLabelIndicator ? "error" : undefined}>
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
