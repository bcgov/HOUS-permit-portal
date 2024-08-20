import React, { useEffect, useMemo } from "react"
import Select from "react-select"
import { IOption, ISubmissionVersion } from "../../../../types/types"

interface SubmissionVersionSelectProps {
  options: IOption<ISubmissionVersion>[]
  onChange: (selectedValue: ISubmissionVersion | null) => void
  value: ISubmissionVersion | null
}

const SubmissionVersionSelect: React.FC<SubmissionVersionSelectProps> = ({ options, onChange, value }) => {
  const handleChange = (option: IOption<ISubmissionVersion> | null) => {
    onChange(option ? option.value : null)
  }

  const sortedOptions = useMemo(() => {
    return options.sort((a, b) => b.value.createdAt - a.value.createdAt)
  }, [options])

  useEffect(() => {
    if (sortedOptions.length > 0 && !value) {
      const defaultOption = sortedOptions[0]

      onChange(defaultOption.value)
    }
  }, [options, onChange])

  return (
    <Select
      options={sortedOptions}
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      value={options.find((option) => option.value.id === value?.id)}
    />
  )
}

export default SubmissionVersionSelect
