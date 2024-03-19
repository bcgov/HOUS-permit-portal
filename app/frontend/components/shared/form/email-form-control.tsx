import {
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
} from "@chakra-ui/react"
import { Envelope, X } from "@phosphor-icons/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../constants"
import { fieldArrayCompatibleErrorMessage } from "./form-helpers"

interface IEmailFormControlProps extends FormControlProps {
  validate?: boolean
  label?: string
  required?: boolean
  showIcon?: boolean
  hideLabel?: boolean
  fieldName?: string
  isRemovable?: boolean
  handleRemove?: () => void
  inputProps?: InputProps
}

export const EmailFormControl = ({
  validate,
  label,
  fieldName = "email",
  required,
  showIcon,
  hideLabel,
  isRemovable,
  handleRemove,
  inputProps,
  ...rest
}: IEmailFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()
  const errorMessage = fieldArrayCompatibleErrorMessage(fieldName, formState)

  return (
    <FormControl isInvalid={errorMessage && !inputProps?.isDisabled} {...rest}>
      {!hideLabel && <FormLabel>{label || t("auth.emailLabel")}</FormLabel>}
      <Flex>
        <InputGroup pos="relative">
          {showIcon && (
            <InputLeftElement pointerEvents="none">
              <Envelope />
            </InputLeftElement>
          )}
          <Input
            {...register(fieldName, {
              required: required && t("ui.isRequired", { field: t("auth.emailLabel") }),
              validate: {
                matchesEmailRegex: (str) => !validate || EMAIL_REGEX.test(str) || t("ui.invalidEmail"),
              },
            })}
            bg="greys.white"
            type={"text"}
            {...inputProps}
          />
        </InputGroup>
        {isRemovable && (
          <IconButton
            onClick={handleRemove}
            isRound
            ml={2}
            size="xs"
            alignSelf="center"
            bg="transparent"
            aria-label="Remove"
            icon={<X size={"10px"} color="text.primary" />}
          />
        )}
      </Flex>
      {errorMessage && !inputProps?.isDisabled && (
        <FormErrorMessage pos="absolute" bottom={-5}>
          {errorMessage}
        </FormErrorMessage>
      )}
    </FormControl>
  )
}
