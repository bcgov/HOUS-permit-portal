import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps<TSearchModel extends ISearch> {
  searchModel: TSearchModel
}

export const RequirementTemplateFilter = observer(function RequirementTemplateIdFilter<TSearchModel extends ISearch>({
  searchModel,
}: IProps<TSearchModel>) {
  const { t } = useTranslation()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplateIdFilter, setRequirementTemplateIdFilter, search } = searchModel as any

  useEffect(() => {
    requirementTemplateStore.fetchFilterOptions()
  }, [])

  const handleChange = (nextValue: string[]) => {
    setRequirementTemplateIdFilter(nextValue)
    search()
  }

  const handleReset = () => {
    setRequirementTemplateIdFilter([])
    search()
  }

  return (
    <CheckboxFilter
      value={requirementTemplateIdFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={requirementTemplateStore.filterOptions}
      title={t("permitProject.index.requirementTemplateFilter")}
    />
  )
})
