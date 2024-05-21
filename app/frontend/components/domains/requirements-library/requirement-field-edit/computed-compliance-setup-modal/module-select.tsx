import { Box, FormControl, FormLabel } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IOption } from "../../../../../types/types"

interface IProps {
  options: IOption[]
  value: IOption | null
  onChange: (option: IOption | null) => void
}

const MODULE_SELECT_LABEL_ID = "compliance-module-select-label"
const MODULE_SELECT_ID = "compliance-module-select-id"

export const ModuleSelect = observer(function ModuleSelect({ value, onChange, options }: IProps) {
  const { t } = useTranslation()
  return (
    <FormControl>
      <FormLabel id={MODULE_SELECT_LABEL_ID} htmlFor={MODULE_SELECT_ID} fontWeight="bold" size="lg">
        {t("requirementsLibrary.modals.computedComplianceSetup.module")}
      </FormLabel>
      <Box px={4}>
        <Select
          isClearable
          inputId={MODULE_SELECT_ID}
          aria-labelledby={MODULE_SELECT_LABEL_ID}
          options={options}
          value={value}
          onChange={onChange}
        />
      </Box>
    </FormControl>
  )
})
