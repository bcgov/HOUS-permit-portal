import { Flex, FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface ITextFormControlProps extends FormControlProps {
  label: string
  fieldName: string
}

export const TextFormControl = ({ label, fieldName }: ITextFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <FormControl isInvalid={!!formState?.errors[fieldName]} flex={1}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            {...register(fieldName, {
              required: true,
              validate: {
                satisfiesNameLength: (str) => (str.length >= 2 && str.length < 128) || t("ui.invalidInput"),
              },
            })}
            type={"text"}
          />
          {formState?.errors[fieldName] && (
            <FormErrorMessage>{formState?.errors[fieldName].message as string}</FormErrorMessage>
          )}
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
