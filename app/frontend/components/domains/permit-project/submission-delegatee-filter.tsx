import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { IPermitApplicationStore } from "../../../stores/permit-application-store"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps {
  searchModel: IPermitApplicationStore
  permitProject: IPermitProject
}

export const SubmissionDelegateeFilter = observer(function SubmissionDelegateeFilter({
  searchModel,
  permitProject,
}: IProps) {
  const { t } = useTranslation()
  const { submissionDelagateeIdFilter, setSubmissionCollaboratorIdFilter, searchPermitApplications } = searchModel
  const [options, setOptions] = React.useState([])

  React.useEffect(() => {
    const fetchOptions = async () => {
      const options = await permitProject.fetchSubmissionCollaboratorOptions()
      setOptions(options)
    }
    fetchOptions()
  }, [permitProject])

  const handleChange = (nextValue: string[]) => {
    setSubmissionCollaboratorIdFilter(nextValue)
    searchPermitApplications()
  }

  const handleReset = () => {
    setSubmissionCollaboratorIdFilter([])
    searchPermitApplications()
  }

  return (
    <CheckboxFilter
      value={submissionDelagateeIdFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={options}
      title={t("permitApplication.submissionCollaboratorFilter")}
    />
  )
})
