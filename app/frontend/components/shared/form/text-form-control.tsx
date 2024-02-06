import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface ITextFormControlProps extends FormControlProps {
  label: string
  fieldName: string
  required?: boolean
}

export const TextFormControl = ({ label, fieldName, required = true, ...rest }: ITextFormControlProps) => {
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
              validate: {
                satisfiesLength: (str) => !required || (str?.length >= 1 && str?.length < 128) || t("ui.invalidInput"),
              },
            })}
            bg="greys.white"
            type={"text"}
          />
          {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
