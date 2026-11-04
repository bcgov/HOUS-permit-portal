import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../setup/root"
import { EStepCodeCompliancePath } from "../../../../types/enums"
import { OptionMenu } from "../option-menu"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeCompliancePath
}

export const CompliancePathSelect = observer(function CompliancePathSelect({ onChange, value }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <OptionMenu
      value={value}
      onChange={onChange}
      placeholder={t("stepCode.import.compliancePath.select")}
      options={selectOptions.compliancePaths}
      label={(option) => t(`stepCode.import.compliancePath.options.${option}`)}
    />
  )
})
