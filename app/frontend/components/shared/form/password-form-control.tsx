import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import PasswordStrengthBar from "react-password-strength-bar"

interface IPasswordFormControlProps extends FormControlProps {
  validate?: boolean
  label?: string
  fieldName?: string
  required?: boolean
}

export const PasswordFormControl = ({
  validate,
  label,
  fieldName = "password",
  required = true,
  ...rest
}: IPasswordFormControlProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const { register, formState, watch } = useFormContext()
  const { t } = useTranslation()
  const passwordWatch = watch("password")

  return (
    <FormControl mb={4} isInvalid={validate && !!formState?.errors?.password} {...rest}>
      <FormLabel>{label || t("auth.passwordLabel")}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register(fieldName, {
              required: required && t("ui.isRequired", { field: label }),
              validate: {
                matchesPasswordRegex: (str) =>
                  !required ||
                  !validate ||
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,64}$/.test(str) ||
                  t("auth.passwordTooWeak"),
              },
            })}
            type={showPassword ? "text" : "password"}
            autoComplete={validate ? "new-password" : "on"}
          />
          {formState?.errors?.password && (
            <FormErrorMessage>{formState?.errors?.password.message as string}</FormErrorMessage>
          )}
        </Flex>

        <InputRightElement pr={14} py={1}>
          <Divider orientation="vertical" borderLeft="1px solid" borderColor="gray.400" />
          <Button variant="link" ml={6} onClick={() => setShowPassword(() => !showPassword)}>
            {showPassword ? t("ui.hide") : t("ui.show")}
          </Button>
        </InputRightElement>
      </InputGroup>
      {validate && (
        <Box mt={4}>
          <PasswordStrengthBar password={passwordWatch} minLength={8} />
        </Box>
      )}
    </FormControl>
  )
}
