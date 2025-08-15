import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  Select,
  SelectProps,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { Phone } from "@phosphor-icons/react"
import { t } from "i18next"
import * as R from "ramda"
import React, { useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IOption, IOptionGroup } from "../../../types/types"
import { DatePicker, IDatePickerProps } from "../date-picker"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface IInputFormControlProps<TInputProps = Partial<InputProps>> extends FormControlProps {
  label?: string
  fieldName?: string
  required?: boolean
  validate?: any
  maxLength?: number
  hint?: string[] | string
  leftElement?: JSX.Element
  rightElement?: JSX.Element
  inputProps?: TInputProps
  key?: string
  LabelInfo?: () => JSX.Element
  showOptional?: boolean
}

interface ISelectFormControlProps extends IInputFormControlProps<Partial<SelectProps>> {
  options?: IOption<string | number>[]
  optionGroups?: IOptionGroup[]
}

const isValidUrl = (url: string) => {
  const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[\w.-]*)?\/?$/i
  return regex.test(url)
}

export const TextFormControl = (props: IInputFormControlProps) => {
  const { inputProps, validate, ...rest } = props
  const mergedProps: IInputFormControlProps = {
    ...rest,
    inputProps: {
      type: "text",
      ...inputProps,
    },
    validate: {
      satisfiesLength: (str) =>
        (!props.required && !str) || (str?.length >= 1 && str?.length < 128) || t("ui.invalidInput"),
      ...validate,
    },
  }
  return <InputFormControl {...mergedProps} />
}

export const UrlFormControl = (props: IInputFormControlProps) => {
  const { field } = useController({
    name: props.fieldName,
  })
  const { value } = field
  const [inputUrl, setInputpUrl] = useState(value)
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let url = event.target.value.trim()
    if (url && !url.match(/^(https?|http?):\/\//i)) {
      url = `https://${url}`
    }
    setInputpUrl(url)
  }
  return (
    <InputFormControl
      {...R.mergeDeepRight(
        {
          inputProps: {
            type: "url",
            value: inputUrl,
            onChange: handleUrlChange,
          },
          validate: {
            validUrl: (str) => !str || isValidUrl(str) || t("ui.invalidUrl"),
          },
        },
        props
      )}
    />
  )
}

export const NumberFormControl = (props: IInputFormControlProps) => {
  return (
    <InputFormControl
      {...(R.mergeDeepRight({ inputProps: { type: "number", step: 0.01 } }, props) as IInputFormControlProps)}
    />
  )
}

export const PhoneFormControl = (props: IInputFormControlProps) => {
  return (
    <InputFormControl
      {...R.mergeDeepRight({ inputProps: { type: "text", maxLength: 10 } }, props)}
      leftElement={<Phone />}
    />
  )
}

export const FileFormControl = (props: IInputFormControlProps) => {
  return <InputFormControl {...(R.mergeDeepRight({ inputProps: { type: "file" } }, props) as IInputFormControlProps)} />
}

export const DatePickerFormControl = ({
  label,
  fieldName,
  required,
  validate,
  hint,
  leftElement,
  rightElement,
  inputProps = {},
  key = fieldName,
  showOptional = true,
  ...rest
}: IInputFormControlProps<Partial<IDatePickerProps>>) => {
  const { control, formState } = useFormContext()
  const { errors } = formState
  const { t } = useTranslation()
  const errorMessage = (fieldName && fieldArrayCompatibleErrorMessage(fieldName, errors)) || null
  const { field } = useController({
    name: fieldName,
    control,
    rules: {
      required: required && t("ui.isRequired", { field: label }),
      validate,
    },
  })
  const { value, onChange } = field

  const id = `${fieldName}-form-control-label`
  return (
    <FormControl isInvalid={!!errorMessage} {...rest}>
      {label && (
        <HStack gap={0}>
          <FormLabel id={id}>{label} </FormLabel>
          {!required && showOptional && (
            <Text ml={-2} mb={2}>
              {t("ui.optional")}
            </Text>
          )}
        </HStack>
      )}

      <InputGroup w="full" display="flex" flexDirection="column" zIndex={1}>
        <DatePicker
          selected={value}
          onChange={onChange}
          containerProps={{
            zIndex: "dropdown",
            w: "full",
            sx: {
              ".react-datepicker-wrapper": { w: "full" },
              ".react-datepicker__input-container": { w: "full" },
            },
          }}
          ariaLabelledBy={id}
          {...inputProps}
        />
        {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        {hint && <FormHelperText color="border.base">{hint}</FormHelperText>}
        {leftElement && <InputLeftElement pointerEvents="none">{leftElement}</InputLeftElement>}
        {rightElement && <InputRightElement pointerEvents="none">{rightElement}</InputRightElement>}
      </InputGroup>
    </FormControl>
  )
}
export const TextAreaFormControl = (props: IInputFormControlProps) => {
  return (
    <InputFormControl
      {...(R.mergeDeepRight(
        {
          inputProps: { as: Textarea }, // Use Chakra's Textarea instead of Input
          validate: {
            satisfiesLength: (str) =>
              (!props.required && !str) || (str?.length >= 1 && str?.length < 512) || "Input is invalid", // Use a default error message or use translation as needed
          },
        },
        props
      ) as IInputFormControlProps)}
    />
  )
}

export const InputFormControl = ({
  label,
  fieldName,
  required,
  validate,
  hint,
  leftElement,
  rightElement,
  inputProps = {},
  key = fieldName,
  LabelInfo,
  showOptional = true,
  ...rest
}: IInputFormControlProps) => {
  const { register, formState } = useFormContext()
  const { errors } = formState
  const { t } = useTranslation()
  const errorMessage = (fieldName && fieldArrayCompatibleErrorMessage(fieldName, errors)) || null
  const registerProps = fieldName
    ? { ...register(fieldName, { required: required && t("ui.isRequired", { field: label }), validate }) }
    : {}

  return (
    <FormControl isInvalid={!!errorMessage} {...rest}>
      {label && (
        <HStack gap={0}>
          <FormLabel>
            {label}
            {required && (
              <Text as="span" color="semantic.error" ml={1}>
                *
              </Text>
            )}
          </FormLabel>
          {!required && showOptional && (
            <Text ml={-2} mb={2}>
              {t("ui.optional")}
            </Text>
          )}
          {LabelInfo && <LabelInfo />}
        </HStack>
      )}

      <InputGroup w="full" display="flex" flexDirection="column">
        <Input bg="greys.white" {...registerProps} {...inputProps} />
        {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        {hint && (
          <FormHelperText mt={1} color="border.base">
            {hint}
          </FormHelperText>
        )}
        {leftElement && <InputLeftElement pointerEvents="none">{leftElement}</InputLeftElement>}
        {rightElement && <InputRightElement pointerEvents="none">{rightElement}</InputRightElement>}
      </InputGroup>
    </FormControl>
  )
}

export const SelectFormControl = ({
  label,
  fieldName,
  required,
  validate,
  hint,
  inputProps = {},
  key = fieldName,
  options,
  optionGroups,
  showOptional = true,
  ...rest
}: ISelectFormControlProps) => {
  const { register, formState } = useFormContext()
  const { errors } = formState
  const { t } = useTranslation()
  const errorMessage = (fieldName && fieldArrayCompatibleErrorMessage(fieldName, errors)) || null
  const registerProps = fieldName
    ? { ...register(fieldName, { required: required && t("ui.isRequired", { field: label }), validate }) }
    : {}

  return (
    <FormControl isInvalid={!!errorMessage} {...rest}>
      {label && (
        <HStack gap={0}>
          <FormLabel>
            {label}
            {required && (
              <Text as="span" color="semantic.error" ml={1}>
                *
              </Text>
            )}
          </FormLabel>
          {!required && showOptional && (
            <Text ml={-2} mb={2}>
              {t("ui.optional")}
            </Text>
          )}
        </HStack>
      )}
      <Select bg="greys.white" {...registerProps} {...inputProps}>
        {options?.map((option) => (
          <option key={option.value.toString()} value={option.value}>
            {option.label}
          </option>
        ))}
        {optionGroups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value.toString()} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      {errorMessage && <FormErrorMessage>{errorMessage as string}</FormErrorMessage>}
      {hint && (
        <FormHelperText mt={1} color="border.base">
          {hint}
        </FormHelperText>
      )}
    </FormControl>
  )
}
