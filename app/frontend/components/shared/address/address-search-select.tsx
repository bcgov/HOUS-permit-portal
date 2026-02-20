import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { AsyncSelect } from "../select/async-select"

export interface ParsedAddress {
  address: string
  city: string
  province: string
  postalCode: string
}

interface AddressSearchSelectProps {
  onAddressSelect: (addressData: ParsedAddress) => void
  placeholder?: string
  stylesToMerge?: any
}

const POSTAL_CODE_REGEX = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i
const portalTarget = typeof document !== "undefined" ? document.body : undefined

export const parseAddress = (fullAddress: string): ParsedAddress => {
  const parts = fullAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  const parsed: ParsedAddress = {
    address: "",
    city: "",
    province: "",
    postalCode: "",
  }

  if (!parts.length) {
    return parsed
  }
  // The address is the first part of the address, so we shift it off the array
  parsed.address = parts.shift() || ""
  // The postal code is the last part of the address, so we pop it off the array
  const lastPart = parts[parts.length - 1]
  if (lastPart && POSTAL_CODE_REGEX.test(lastPart.replace(/\s/g, ""))) {
    parsed.postalCode = lastPart
    parts.pop()
  }

  if (parts.length) {
    parsed.province = parts.pop() || ""
  }

  if (parts.length) {
    parsed.city = parts.pop() || ""
  }

  if (!parsed.city && parts.length) {
    parsed.city = parts.pop() || ""
  }

  if (parts.length) {
    parsed.address = [parsed.address, ...parts].filter(Boolean).join(", ")
  }

  // Join the address parts back together with a comma
  return parsed
}

const AddressSearchSelect = observer(function ({
  onAddressSelect,
  placeholder,
  stylesToMerge,
}: AddressSearchSelectProps) {
  const { geocoderStore } = useMst()
  const { fetchSiteOptions: fetchOptions } = geocoderStore
  const { t } = useTranslation() as any

  const fetchAddressOptions = (inputValue: string, callback: (options: IOption[]) => void) => {
    if (inputValue.length > 3) {
      // Fetch the address options from the geocoder store
      fetchOptions(inputValue)
        .then((response) => callback(response || []))
        .catch(() => callback([]))
    } else {
      callback([])
    }
  }

  // Debounce the fetch address options to prevent too many requests
  const debouncedFetchAddressOptions: any = useCallback(debounce(fetchAddressOptions, 600), [])

  const handleAddressSelect = (option: IOption | null) => {
    // If no option is selected, return
    if (!option) return
    // Get the full address from the option
    const fullAddress = option.label || ""
    onAddressSelect(parseAddress(fullAddress))
  }

  const baseStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  }

  const mergedStyles = stylesToMerge ? { ...baseStyles, ...stylesToMerge } : baseStyles

  return (
    <AsyncSelect
      loadOptions={debouncedFetchAddressOptions}
      onChange={handleAddressSelect}
      placeholder={placeholder || t("ui.enterAddress")}
      noOptionsMessage={() => "Type at least 4 characters to search"}
      isClearable
      isCreatable={false}
      defaultOptions
      cacheOptions
      menuPortalTarget={portalTarget}
      styles={mergedStyles}
    />
  ) as any
})

export default AddressSearchSelect
