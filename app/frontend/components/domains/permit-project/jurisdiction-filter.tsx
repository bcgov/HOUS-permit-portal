import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IPermitProjectStore } from "../../../stores/permit-project-store"
import { IOption } from "../../../types/types"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps {
  searchModel: IPermitProjectStore
}

export const JurisdictionFilter = observer(function JurisdictionFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const { jurisdictionFilter, setJurisdictionFilter, searchPermitProjects } = searchModel
  const [options, setOptions] = useState<IOption[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      const response = await permitProjectStore.jurisdictionOptions()
      if (response.ok) {
        setOptions(response.data.data)
      }
    }
    fetchOptions()
  }, [])

  const handleChange = (nextValue: string[]) => {
    setJurisdictionFilter(nextValue)
    searchPermitProjects()
  }

  const handleReset = () => {
    setJurisdictionFilter([])
    searchPermitProjects()
  }

  return (
    <CheckboxFilter
      value={jurisdictionFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={options}
      title={t("permitProject.jurisdictionFilter")}
    />
  )
})
