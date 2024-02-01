import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../constants"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface IEmailFormControlProps extends FormControlProps {
  validate?: boolean
  required?: boolean
  fieldName?: string
}

export const EmailFormControl = ({ validate, fieldName = null, required = true, ...rest }: IEmailFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()
  const errorMessage = fieldArrayCompatibleErrorMessage(fieldName, formState)

  return (
    <FormControl isInvalid={errorMessage} {...rest}>
      <FormLabel>{t("auth.emailLabel")}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register(fieldName || "email", {
              required: true,
              validate: {
                matchesEmailRegex: (str) => !validate || EMAIL_REGEX.test(str) || t("ui.invalidEmail"),
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
