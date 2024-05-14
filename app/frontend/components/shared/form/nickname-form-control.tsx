import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface INicknameFormControlProps extends FormControlProps {
  validate?: boolean
  autoFocus?: boolean
  autoComplete?: string
  defaultValue?: string
  required?: boolean
}

export const NicknameFormControl = ({
  validate,
  autoFocus,
  autoComplete,
  defaultValue,
  required,
  ...rest
}: INicknameFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <FormControl mb={4} isInvalid={validate && !!formState?.errors?.nickname} {...rest}>
      <FormLabel>{t("auth.nicknameLabel")}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register("nickname", {
              required: required && t("ui.isRequired", { field: t("auth.nicknameLabel") }),
              validate: {
                satisfiesUsernameRegex: (str) =>
                  !validate || (str.length >= 2 && str.length < 128) || t("ui.invalidInput"),
              },
            })}
            type={"text"}
            autoComplete={autoComplete || "nickname"}
            autoFocus={autoFocus}
            defaultValue={defaultValue}
          />
          {formState?.errors?.nickname && (
            <FormErrorMessage>{formState?.errors?.nickname.message as string}</FormErrorMessage>
          )}
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
