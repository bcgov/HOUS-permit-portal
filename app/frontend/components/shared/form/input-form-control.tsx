import {
  Box,
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
} from "@chakra-ui/react"
import { AsteriskSimple, Phone } from "@phosphor-icons/react"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { DatePicker, IDatePickerProps } from "../date-picker"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface IInputFormControlProps<TInputProps = Partial<InputProps>> extends FormControlProps {
  label?: string
  fieldName?: string
  required?: boolean
  validate?: any
  maxLength?: number
  hint?: string[]
  leftElement?: JSX.Element
  rightElement?: JSX.Element
  inputProps?: TInputProps
  key?: string
}

export const TextFormControl = (props: IInputFormControlProps) => {
  return (
    <InputFormControl
      {...(R.mergeDeepRight(
        {
          inputProps: { type: "text" },
          validate: {
            satisfiesLength: (str) =>
              !props.required || (str?.length >= 1 && str?.length < 128) || t("ui.invalidInput"),
          },
        },
        props
      ) as IInputFormControlProps)}
    />
  )
}

export const UrlFormControl = (props: IInputFormControlProps) => {
  return (
    <InputFormControl
      {...R.mergeDeepRight(
        {
          inputProps: { type: "url" },
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
          {required && (
            <Box color="semantic.error" ml={-2} mb={2}>
              <AsteriskSimple />
            </Box>
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

const InputFormControl = ({
  label,
  fieldName,
  required,
  validate,
  hint,
  leftElement,
  rightElement,
  inputProps = {},
  key = fieldName,
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
          <FormLabel>{label} </FormLabel>
          {required && (
            <Box color="semantic.error" ml={-2} mb={2}>
              <AsteriskSimple />
            </Box>
          )}
        </HStack>
      )}

      <InputGroup w="full" display="flex" flexDirection="column">
        <Input bg="greys.white" {...registerProps} {...inputProps} />
        {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        {hint && <FormHelperText color="border.base">{hint}</FormHelperText>}
        {leftElement && <InputLeftElement pointerEvents="none">{leftElement}</InputLeftElement>}
        {rightElement && <InputRightElement pointerEvents="none">{rightElement}</InputRightElement>}
      </InputGroup>
    </FormControl>
  )
}
