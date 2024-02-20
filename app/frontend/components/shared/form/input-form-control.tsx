import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface IInputFormControlProps extends FormControlProps {
  label: string
  fieldName: string
  required?: boolean
  validate?: any
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
  inputProps = {},
  ...rest
}: IInputFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()
  const errorMessage = fieldArrayCompatibleErrorMessage(fieldName, formState)
  return (
    <FormControl isInvalid={errorMessage} flex={1} {...rest}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register(fieldName, {
              required: required && t("ui.isRequired", { field: label }),
              validate,
            })}
            bg="greys.white"
            {...inputProps}
          />
          {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
