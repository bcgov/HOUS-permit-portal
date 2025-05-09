import { FormControl, FormControlProps, FormErrorMessage, FormLabel } from "@chakra-ui/react"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import AsyncSelect from "react-select/async"

interface IAddressFormControlProps extends FormControlProps {
  fieldName: string
  label?: string
}

interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  icon?: string
  address?: {
    // addressdetails=1
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city_district?: string
    city?: string
    town?: string
    village?: string
    postcode?: string
    country?: string
    country_code?: string
    [key: string]: string | undefined // for other potential address parts
  }
}

interface OptionType {
  label: string
  value: string // We'll store the display_name as the value
}

export const AddressFormControl = ({ label, fieldName, ...rest }: IAddressFormControlProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const { t } = useTranslation()

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (!inputValue || inputValue.length < 3) {
      // Don't search for very short strings
      return []
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?addressdetails=1&format=json&q=${encodeURIComponent(inputValue)}`
      )
      debugger
      const data: NominatimResult[] = await response.json()
      return data.map((item) => ({
        label: item.display_name,
        value: item.display_name, // Or you could use item.place_id if you need a unique ID
      }))
    } catch (error) {
      debugger
      console.error("Error fetching address suggestions:", error)
      return []
    }
  }

  return (
    <FormControl isInvalid={!!errors[fieldName]} flex={1} {...rest}>
      {label && <FormLabel htmlFor={fieldName}>{label}</FormLabel>}
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <AsyncSelect
            {...field}
            inputId={fieldName}
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions // To show some options on first load if desired, or pass true to load initial set
            placeholder={t("ui.typeToSearch") || "Type to search address..."}
            isClearable
            // styles={chakraStyles} // Optional: if you have custom Chakra-compatible styles for react-select
            // You might want to customize react-select further, e.g. with noOptionsMessage
            // or loadingMessage
            onChange={(selectedOption: OptionType | null) => {
              field.onChange(selectedOption ? selectedOption.value : "")
            }}
            onBlur={field.onBlur}
            value={field.value ? { label: field.value, value: field.value } : null}
          />
        )}
      />
      {errors[fieldName] && <FormErrorMessage>{errors[fieldName].message as string}</FormErrorMessage>}
    </FormControl>
  )
}
