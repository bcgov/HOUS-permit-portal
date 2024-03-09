import {
  BoxProps,
  Checkbox,
  CheckboxGroup,
  FormControlProps,
  FormLabelProps,
  HeadingProps,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Radio,
  RadioGroup,
  Select,
  SelectProps,
  Stack,
  SwitchProps,
  Textarea,
} from "@chakra-ui/react"
import { CalendarBlank, Envelope, MapPin, Phone } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { ENumberUnit, ERequirementContactFieldItemType, ERequirementType } from "../../../../types/enums"
import { GenericContactDisplay } from "./generic-contact-display"
import { GenericFieldDisplay } from "./generic-field-display"

export type TRequirementFieldDisplayProps = {
  labelProps?: Partial<FormLabelProps | HeadingProps>
  label?: string
  options?: string[]
  helperText?: string
  unit?: ENumberUnit | null
  selectProps?: Partial<SelectProps>
  addMultipleContactProps?: {
    shouldRender?: boolean
    isChecked?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    formControlProps?: FormControlProps
    switchProps?: SwitchProps
  }
  requirementType: ERequirementType
  showAddLabelIndicator?: boolean
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
              <Phone />
            </InputLeftElement>
            <Input bg={"white"} />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.email](props: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        inputDisplay={
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Envelope />
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

  [ERequirementType.generalContact](props: TRequirementFieldDisplayProps) {
    const contactFieldItemTypes: Array<{ type: ERequirementContactFieldItemType; containerProps?: BoxProps }> = [
      { type: ERequirementContactFieldItemType.firstName },
      { type: ERequirementContactFieldItemType.lastName },
      { type: ERequirementContactFieldItemType.email },
      { type: ERequirementContactFieldItemType.phone },
      {
        type: ERequirementContactFieldItemType.address,
        containerProps: {
          gridColumn: "1 / span 2",
          sx: {
            ".chakra-form-control input": {
              maxW: "full",
            },
          },
        },
      },
      { type: ERequirementContactFieldItemType.organization },
    ]

    return <GenericContactDisplay contactFieldItems={contactFieldItemTypes} {...props} />
  },

  [ERequirementType.professionalContact](props: TRequirementFieldDisplayProps) {
    const contactFieldItemTypes: Array<{ type: ERequirementContactFieldItemType; containerProps?: BoxProps }> = [
      { type: ERequirementContactFieldItemType.firstName },
      { type: ERequirementContactFieldItemType.lastName },
      { type: ERequirementContactFieldItemType.email },
      { type: ERequirementContactFieldItemType.phone },
      {
        type: ERequirementContactFieldItemType.address,
        containerProps: {
          gridColumn: "1 / span 2",
          sx: {
            ".chakra-form-control input": {
              maxW: "full",
            },
          },
        },
      },
      { type: ERequirementContactFieldItemType.professionalAssociation },
      { type: ERequirementContactFieldItemType.professionalNumber },
      { type: ERequirementContactFieldItemType.organization },
    ]

    return <GenericContactDisplay contactFieldItems={contactFieldItemTypes} {...props} />
  },
}

export const RequirementFieldDisplay = observer(function RequirementFieldDisplay(props: TRequirementFieldDisplayProps) {
  return requirementsComponentMap[props.requirementType]?.(props) ?? null
})

export function hasRequirementFieldDisplayComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}
