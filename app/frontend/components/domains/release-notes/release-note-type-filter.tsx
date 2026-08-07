import { FormControl, FormLabel, Select } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RELEASE_NOTE_TYPES } from "../../../constants/release-note-type-config"
import { EReleaseNoteType } from "../../../types/enums"

type ReleaseNoteTypeFilterProps = Readonly<{
  value: EReleaseNoteType | null
  onChange: (releaseType: EReleaseNoteType | null) => void
}>

export function ReleaseNoteTypeFilter({ value, onChange }: ReleaseNoteTypeFilterProps) {
  const { t } = useTranslation()

  return (
    <FormControl display="flex" alignItems="center" gap={3} w="auto">
      <FormLabel m={0} whiteSpace="nowrap" fontSize="sm">
        {t("releaseNote.viewing.filterByType")}
      </FormLabel>
      <Select
        bg="white"
        w="240px"
        size="sm"
        value={value ?? ""}
        onChange={(e) => {
          const next = e.target.value
          onChange(next ? (next as EReleaseNoteType) : null)
        }}
      >
        <option value="">{t("releaseNote.viewing.allTypes")}</option>
        {RELEASE_NOTE_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`releaseNote.types.${type}`)}
          </option>
        ))}
      </Select>
    </FormControl>
  )
}
