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
import { CalendarBlank, Envelope, FileCloud, LightningA, MapPin, Phone } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { ENumberUnit, ERequirementContactFieldItemType, ERequirementType } from "../../../../types/enums"
import { GenericContactDisplay } from "./generic-contact-display"
import { GenericFieldDisplay } from "./generic-field-display"
import { GenericMultiDisplay } from "./generic-multi-display"

export type TRequirementFieldDisplayProps = {
  matchesStepCodePackageRequirementCode?: boolean
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
  showAddButton?: boolean
  requirementType: ERequirementType
  showAddLabelIndicator?: boolean
  required?: boolean
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

  [ERequirementType.checkbox]({
    options = defaultOptions,
    labelProps,
    ...genericDisplayProps
  }: TRequirementFieldDisplayProps) {
    return (
      <GenericFieldDisplay
        containerProps={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
        }}
        labelProps={{
          ...labelProps,
          mb: 0,
          order: 2,
        }}
        inputDisplay={
          // this is a hack needed to leverage form control, but still make the checkbox accessible
          <CheckboxGroup>
            <Checkbox sx={{ "span:last-child": { display: "none" } }} mr={2} order={1} alignItems="flex-start" pt="1.5">
              Yes
            </Checkbox>
          </CheckboxGroup>
        }
        editorContainerProps={{ order: 3, gridColumn: "span 2" }}
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
                <Checkbox
                  key={index}
                  value={option}
                  alignItems="flex-start"
                  sx={{
                    "& .chakra-checkbox__control": { marginTop: "1" },
                  }}
                >
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
    return <GenericFieldDisplay inputDisplay={<DummyFileInput />} {...props} />
  },

  [ERequirementType.energyStepCode](props: TRequirementFieldDisplayProps) {
    return <GenericFieldDisplay inputDisplay={<DummyStepCodeInput />} {...props} />
  },

  [ERequirementType.pidInfo](props: TRequirementFieldDisplayProps) {
    const pidInfoFieldItemTypes: Array<{
      type: ERequirementType
      key: string
      label: string
      containerProps?: BoxProps
      required?: boolean
    }> = [
      {
        type: ERequirementType.text,
        key: "pid",
        label: "PID",
        required: props?.required,
      }, //pid or pin?
      {
        type: ERequirementType.text,
        key: "folio_number",
        label: "Folio Number",
      }, //folio
      {
        type: ERequirementType.address,
        key: "address",
        label: "Address",
        containerProps: {
          gridColumn: "1 / span 2",
          sx: {
            ".chakra-form-control input": {
              maxW: "full",
            },
          },
        },
      },
    ]
    return <GenericMultiDisplay fieldItems={pidInfoFieldItemTypes} {...props} showAddButton={true} />
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
      { type: ERequirementContactFieldItemType.title },
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
      { type: ERequirementContactFieldItemType.title },
      { type: ERequirementContactFieldItemType.businessName },
      { type: ERequirementContactFieldItemType.businessLicense },
      { type: ERequirementContactFieldItemType.professionalAssociation },
      { type: ERequirementContactFieldItemType.professionalNumber },
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

function DummyFileInput() {
  return (
    <InputGroup border={"1px solid var(--chakra-colors-border-light)"} borderRadius={"var(--input-border-radius)"}>
      <InputLeftElement pointerEvents="none">
        <FileCloud />
      </InputLeftElement>
      <Input bg={"white"} type={"file"} visibility={"hidden"} />
    </InputGroup>
  )
}

function DummyStepCodeInput() {
  return (
    <InputGroup border={"1px solid var(--chakra-colors-border-light)"} borderRadius={"var(--input-border-radius)"}>
      <InputLeftElement pointerEvents="none">
        <LightningA />
      </InputLeftElement>
      <Input bg={"white"} type={"file"} visibility={"hidden"} />
    </InputGroup>
  )
}
