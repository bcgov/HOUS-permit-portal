import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps<TSearchModel extends ISearch> {
  searchModel: TSearchModel
}

export const RequirementTemplateFilter = observer(function RequirementTemplateFilter<TSearchModel extends ISearch>({
  searchModel,
}: IProps<TSearchModel>) {
  const { t } = useTranslation()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplateFilter, setRequirementTemplateFilter, search } = searchModel as any

  useEffect(() => {
    requirementTemplateStore.fetchFilterOptions()
  }, [])

  const handleChange = (nextValue: string[]) => {
    setRequirementTemplateFilter(nextValue)
    search()
  }

  const handleReset = () => {
    setRequirementTemplateFilter([])
    search()
  }

  return (
    <CheckboxFilter
      value={requirementTemplateFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={requirementTemplateStore.filterOptions}
      title={t("permitProject.index.requirementTemplateFilter")}
    />
  )
})
