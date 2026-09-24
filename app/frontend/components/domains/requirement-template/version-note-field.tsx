import { FormControl, FormHelperText, FormLabel, Input } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  value: string
  onChange: (value: string) => void
  isDisabled?: boolean
}

export function VersionNoteField({ value, onChange, isDisabled }: IProps) {
  const { t } = useTranslation()

  return (
    <FormControl>
      <FormLabel fontWeight={700}>{t("requirementTemplate.edit.versionNote")}</FormLabel>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        isDisabled={isDisabled}
        maxLength={128}
        bg="greys.white"
      />
      <FormHelperText mt={1} color="border.base">
        {t("requirementTemplate.edit.versionNoteHint")}
      </FormHelperText>
    </FormControl>
  )
}

export function normalizedVersionNote(value: string) {
  return value.trim() || undefined
}
