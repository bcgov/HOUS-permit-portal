import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface IInputFormControlProps extends FormControlProps {
  label?: string
  fieldName?: string
  required?: boolean
  validate?: any
  hint?: string[]
  leftElement?: JSX.Element
  rightElement?: JSX.Element
  inputProps?: any
}

export const TextFormControl = (props: IInputFormControlProps) => {
  return (
    <InputFormControl
      {...R.mergeDeepRight(
        {
          inputProps: { type: "text" },
          validate: {
            satisfiesLength: (str) =>
              !props.required || (str?.length >= 1 && str?.length < 128) || t("ui.invalidInput"),
          },
        },
        props
      )}
    />
  )
}

export const NumberFormControl = (props: IInputFormControlProps) => {
  return <InputFormControl {...R.mergeDeepRight({ inputProps: { type: "number", step: 0.01 } }, props)} />
}

export const FileFormControl = (props: IInputFormControlProps) => {
  return <InputFormControl {...R.mergeDeepRight({ inputProps: { type: "file" } }, props)} />
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
      {label && <FormLabel>{label}</FormLabel>}
      <InputGroup w="full" d="flex" flexDirection="column">
        <Input bg="greys.white" {...registerProps} {...inputProps} />
        {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        {hint && <FormHelperText color="border.base">{hint}</FormHelperText>}
        {leftElement && <InputLeftElement pointerEvents="none">{leftElement}</InputLeftElement>}
        {rightElement && <InputRightElement pointerEvents="none">{rightElement}</InputRightElement>}
      </InputGroup>
    </FormControl>
  )
}
