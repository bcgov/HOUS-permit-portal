import { InputGroup } from "@/components/ui/input-group"
import {
  Field,
  Flex,
  FormControlProps,
  HStack,
  IconButton,
  Input,
  InputElement,
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
  pos?: string
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
    <Field.Root invalid={errorMessage && !(inputProps?.disabled ?? inputProps?.isDisabled)} {...rest}>
      <HStack gap={0}>
        {!hideLabel && (
          <>
            <Field.Label>
              {label || t("auth.emailLabel")}
              {required && (
                <Text as="span" color="semantic.error" ml={1}>
                  *
                </Text>
              )}
            </Field.Label>
            {!required && showOptional && (
              <Text ml={-2} mb={1}>
                {t("ui.optional")}
              </Text>
            )}
          </>
        )}
      </HStack>
      <Flex>
        <InputGroup pos="relative">
          {showIcon && (
            <InputElement pointerEvents="none">
              <Envelope
                color={
                  inputProps?.isDisabled ? "var(--chakra-colors-greys-grey01)" : "var(--chakra-colors-text-primary)"
                }
              />
            </InputElement>
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
          >
            <X size={"10px"} color="text.primary" />
          </IconButton>
        )}
      </Flex>
      {errorMessage && !inputProps?.isDisabled && <Field.ErrorText>{String(errorMessage)}</Field.ErrorText>}
    </Field.Root>
  )
}
