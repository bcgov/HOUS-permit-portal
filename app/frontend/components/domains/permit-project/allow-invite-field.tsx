import { FormControl, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const AllowInviteField = ({
  value,
  isDisabled,
  onChange,
}: {
  value: boolean
  isDisabled?: boolean
  onChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()

  return (
    <FormControl as="fieldset">
      <Text as="legend" fontSize="md" fontWeight="normal" mb={2}>
        {t("permitProject.people.allowInvitePrompt")}
      </Text>
      <RadioGroup
        value={value ? "true" : "false"}
        isDisabled={isDisabled}
        onChange={(next) => onChange(next === "true")}
      >
        <VStack align="flex-start" spacing={2}>
          <Radio value="true">{t("ui.yes")}</Radio>
          <Radio value="false">{t("ui.no")}</Radio>
        </VStack>
      </RadioGroup>
    </FormControl>
  )
}
