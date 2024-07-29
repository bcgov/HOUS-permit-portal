import React, { useEffect } from "react"
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

  useEffect(() => {
    if (options.length > 0 && !value) {
      const defaultOption = options[0]

      onChange(defaultOption.value)
    }
  }, [options, onChange])

  return (
    <Select
      options={options}
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      value={options.find((option) => option.value.id === value?.id)}
    />
  )
}

export default SubmissionVersionSelect
