import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface IUsernameFormControlProps extends FormControlProps {
  validate?: boolean
  autofocus?: boolean
}

export const UsernameFormControl = ({ validate, autoFocus, ...rest }: IUsernameFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <FormControl mb={4} isInvalid={validate && !!formState?.errors?.username} {...rest}>
      <FormLabel>{t("auth.usernameLabel")}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register("username", {
              required: true,
              validate: {
                satisfiesUsernameRegex: (str) => !validate || str.length >= 2 || t("ui.invalidInput"),
              },
            })}
            type={"text"}
            autoFocus={autoFocus}
          />
          {formState?.errors?.username && (
            <FormErrorMessage>{formState?.errors?.username.message as string}</FormErrorMessage>
          )}
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
