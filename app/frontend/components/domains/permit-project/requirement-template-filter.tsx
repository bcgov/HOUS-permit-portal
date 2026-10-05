import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
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
  const { permitProjectId } = useParams<{ permitProjectId?: string }>()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplateIdFilter, setRequirementTemplateIdFilter, search, isSearching } = searchModel as any
  const wasSearching = useRef(false)

  const fetchOptions = () =>
    requirementTemplateStore.fetchFilterOptions(permitProjectId ? { permitProjectId } : undefined)

  useEffect(() => {
    fetchOptions()
  }, [permitProjectId])

  useEffect(() => {
    const searchJustFinished = wasSearching.current && !isSearching
    wasSearching.current = isSearching
    if (!searchJustFinished) return
    fetchOptions()
  }, [isSearching, permitProjectId])

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
