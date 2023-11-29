import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../constants"

interface IEmailFormControlProps extends FormControlProps {
  validate?: boolean
}

export const EmailFormControl = ({ validate, ...rest }: IEmailFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <FormControl mb={4} isInvalid={validate && !!formState?.errors?.email} {...rest}>
      <FormLabel>{t("auth.emailLabel")}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register("email", {
              required: true,
              validate: {
                matchesEmailRegex: (str) => !validate || EMAIL_REGEX.test(str) || t("ui.invalidInput"),
              },
            })}
            type={"text"}
          />
          {formState?.errors?.email && (
            <FormErrorMessage>{formState?.errors?.email.message as string}</FormErrorMessage>
          )}
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
