import { FormControl, FormLabel } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { RELEASE_NOTE_TYPES } from "../../../constants/release-note-type-config"
import { EReleaseNoteType } from "../../../types/enums"
import { IOption } from "../../../types/types"

type ReleaseNoteTypeFilterProps = Readonly<{
  value: EReleaseNoteType | null
  onChange: (releaseType: EReleaseNoteType | null) => void
}>

export function ReleaseNoteTypeFilter({ value, onChange }: ReleaseNoteTypeFilterProps) {
  const { t } = useTranslation()
  const uniqueId = React.useId()

  const options: IOption[] = [
    { label: t("releaseNote.viewing.allTypes"), value: "" },
    ...RELEASE_NOTE_TYPES.map((type) => ({
      label: t(`releaseNote.types.${type}`),
      value: type,
    })),
  ]
  const selectedOption = options.find((option) => option.value === (value ?? "")) ?? options[0]

  return (
    <FormControl display="flex" alignItems="center" gap={3} w="auto">
      <FormLabel htmlFor={uniqueId} m={0} whiteSpace="nowrap" fontSize="sm">
        {t("releaseNote.viewing.filterByType")}
      </FormLabel>
      <Select
        inputId={uniqueId}
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option?.value ? (option.value as EReleaseNoteType) : null)}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        styles={{
          container: (css) => ({ ...css, width: "240px" }),
        }}
      />
    </FormControl>
  )
}
