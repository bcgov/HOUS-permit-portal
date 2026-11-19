import { FormControl, FormErrorMessage, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const AllowInviteField = ({
  value,
  isDisabled,
  inputId,
  errorMessage,
  onChange,
}: {
  value: boolean | ""
  isDisabled?: boolean
  inputId?: string
  errorMessage?: string
  onChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()
  const selected = value === true ? "true" : value === false ? "false" : ""

  return (
    <FormControl as="fieldset" isInvalid={Boolean(errorMessage)}>
      <Text as="legend" fontSize="md" fontWeight="normal" mb={2}>
        {t("permitProject.people.allowInvitePrompt")}
      </Text>
      <RadioGroup value={selected} isDisabled={isDisabled} onChange={(next) => onChange(next === "true")}>
        <VStack align="flex-start" spacing={2}>
          <Radio id={inputId} value="true">
            {t("ui.yes")}
          </Radio>
          <Radio value="false">{t("ui.no")}</Radio>
        </VStack>
      </RadioGroup>
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  )
}
