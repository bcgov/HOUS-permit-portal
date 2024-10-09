import {
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  Text,
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
  inputRightElement?: JSX.Element
  showOptional?: boolean
}

export const EmailFormControl = ({
  validate,
  label,
  fieldName,
  required,
  showIcon,
  hideLabel,
  isRemovable,
  handleRemove,
  inputProps,
  inputRightElement,
  showOptional = true,
  ...rest
}: IEmailFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()
  const errorMessage = fieldName && fieldArrayCompatibleErrorMessage(fieldName, formState?.errors)

  return (
    <FormControl isInvalid={errorMessage && !inputProps?.isDisabled} {...rest}>
      <HStack gap={0}>
        {!hideLabel && (
          <>
            <FormLabel>{label || t("auth.emailLabel")}</FormLabel>
            {!required && showOptional && (
              <Text ml={-2} mb={2}>
                {t("ui.optional")}
              </Text>
            )}
          </>
        )}
      </HStack>
      <Flex>
        <InputGroup pos="relative">
          {showIcon && (
            <InputLeftElement pointerEvents="none">
              <Envelope
                color={
                  inputProps?.isDisabled ? "var(--chakra-colors-greys-grey01)" : "var(--chakra-colors-text-primary)"
                }
              />
            </InputLeftElement>
          )}
          <Input
            {...(fieldName &&
              register(fieldName, {
                required: required && t("ui.isRequired", { field: t("auth.emailLabel") }),
                validate: {
                  matchesEmailRegex: (str) =>
                    !validate || (!required && !str) || EMAIL_REGEX.test(str) || t("ui.invalidEmail"),
                },
              }))}
            bg="greys.white"
            type={"text"}
            placeholder={t("ui.emailPlaceholder")}
            {...inputProps}
          />
          {inputRightElement}
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
