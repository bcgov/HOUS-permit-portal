import React, { useMemo } from "react"
import Select from "react-select"
import { IFuelType, IOption } from "../../../../types/types"
import { TAsyncSelectProps } from "../async-select"

interface IFuelTypeSelectProps {
  options: IOption<IFuelType>[]
  onChange: (selectedValue: IFuelType | null) => void
  value: IFuelType | null
  selectProps?: Partial<Omit<TAsyncSelectProps, "stylesToMerge">>
}

const FuelTypeSelect: React.FC<IFuelTypeSelectProps> = ({ options, onChange, value, selectProps }) => {
  const handleChange = (option: IOption<IFuelType> | null) => {
    onChange(option ? option.value : null)
  }

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value.id === value?.id)
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
