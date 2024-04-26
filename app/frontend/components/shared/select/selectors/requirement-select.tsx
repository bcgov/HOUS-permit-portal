import React from "react"
import Select, { Props as SelectProps } from "react-select"
import { IOption } from "../../../../types/types"

interface IRequirementSelectProps extends SelectProps<IOption, false> {
  onChange: (option: IOption) => void
  selectedOption?: IOption
  options: IOption[]
}

export const RequirementSelect: React.FC<IRequirementSelectProps> = ({ selectedOption, options, ...selectProps }) => {
  return <Select value={selectedOption} options={options} {...selectProps} />
}
