import { Box, FormControl, FormLabel } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IOption } from "../../../../../types/types"

const VALUE_EXTRACTION_FIELD_SELECT_LABEL_ID = "compliance-extraction-field-select-label"
const VALUE_EXTRACTION_FIELD_SELECT_ID = "compliance-extraction-field-select-id"

interface IProps {
  options: IOption[]
  value: IOption | null
  onChange: (option: IOption | null) => void
}

export const ValueExtractionFieldSelect = observer(function ValueExtractionFieldSelect({
  onChange,
  options,
  value,
}: IProps) {
  const { t } = useTranslation()
  return (
    <FormControl>
      <FormLabel
        id={VALUE_EXTRACTION_FIELD_SELECT_LABEL_ID}
        htmlFor={VALUE_EXTRACTION_FIELD_SELECT_ID}
        fontWeight="bold"
        size="lg"
      >
        {t("requirementsLibrary.modals.computedComplianceSetup.valueExtractionField")}
      </FormLabel>
      <Box px={4}>
        <Select
          inputId={VALUE_EXTRACTION_FIELD_SELECT_ID}
          aria-labelledby={VALUE_EXTRACTION_FIELD_SELECT_LABEL_ID}
          options={options}
          value={value}
          onChange={onChange}
        />
      </Box>
    </FormControl>
  )
})
