import React, { useMemo } from "react"
import Select from "react-select"
import { IOption } from "../../../../types/types"
import { TAsyncSelectProps } from "../async-select"

interface IFuelTypeSelectProps {
  options: IOption[]
  onChange: (fuelTypeId: string | null) => void
  value: string | null
  selectProps?: Partial<Omit<TAsyncSelectProps, "stylesToMerge">>
}

const FuelTypeSelect: React.FC<IFuelTypeSelectProps> = ({ options, onChange, value, selectProps }) => {
  const handleChange = (option: IOption | null) => {
    onChange(option ? option.value : null)
  }

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) ?? null
  }, [JSON.stringify(options), value])

  return (
    <Select
      options={options}
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      value={selectedOption}
      {...selectProps}
    />
  )
}

export default FuelTypeSelect
