import React, { useMemo } from "react"
import Select from "react-select"
import { IFuelType, IOption } from "../../../../types/types"

interface IFuelTypeSelectProps {
  options: IOption<IFuelType>[]
  onChange: (selectedValue: IFuelType | null) => void
  value: IFuelType | null
}

const FuelTypeSelect: React.FC<IFuelTypeSelectProps> = ({ options, onChange, value }) => {
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
    />
  )
}

export default FuelTypeSelect
