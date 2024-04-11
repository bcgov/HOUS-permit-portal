import { FormControl, FormLabel, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, OptionProps, StylesConfig, components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { RouterLink } from "../../navigation/router-link"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TSitesSelectProps = {
  onChange: (option: IOption) => void
  value: IOption
  addressName?: string
} & Partial<TAsyncSelectProps>

// Please be advised that this is expected to be used within a form context!

export const AddressSelect = observer(function ({
  onChange,
  value,
  stylesToMerge,
  addressName = "address",
  ...rest
}: TSitesSelectProps) {
  const { geocoderStore } = useMst()
  const { fetchSiteOptions: fetchOptions } = geocoderStore

  const { setValue } = useFormContext()
  const { t } = useTranslation()

  const fetchSiteOptions = (address: string, callback: (options) => void) => {
    if (address.length > 3) {
      fetchOptions(address).then((options: IOption[]) => {
        setValue(addressName, null)
        callback(options)
      })
    } else callback([])
  }

  const debouncedFetchOptions = useCallback(debounce(fetchSiteOptions, 1000), [])

  const customStyles: StylesConfig<IOption, boolean> = {
    container: (provided) => ({
      ...provided,
      padding: 0,
      width: "100%", // This will make the container have a width of 100%
    }),
    control: (provided) => ({
      ...provided,
      borderRadius: "4px",
      paddingInline: "0.75rem",
      height: "40px",
      width: "100%", // Ensure the control also takes up 100% width
    }),
    menu: (provided) => ({
      ...provided,
      width: "100%", // Ensure the menu matches the width of the control/container
      background: "var(--chakra-colors-greys-grey10)",
    }),
    // Add other custom styles as needed
  }
  return (
    <FormControl w="full" zIndex={2}>
      <FormLabel>{t("landing.addressSelectLabel")}</FormLabel>
      <InputGroup w="full">
        <AsyncSelect<IOption, boolean>
          isClearable={true}
          onChange={onChange}
          placeholder={t("ui.searchAddresses")}
          value={value}
          defaultValue={value}
          components={{
            Control,
            Option,
            Input,
          }}
          styles={customStyles}
          defaultOptions
          loadOptions={debouncedFetchOptions}
          closeMenuOnSelect={true}
          isCreatable={false}
          {...rest}
        />
      </InputGroup>
      <Text mt={2}>
        {t("landing.cantFind")} <RouterLink to="/jurisdictions">{t("landing.browseList")}</RouterLink>
      </Text>
    </FormControl>
  )
})

const Option = (props: OptionProps<IOption>) => {
  return (
    <components.Option {...props}>
      <HStack color={"text.secondary"} fontSize={"xs"}>
        <MapPin size={"12px"} style={{ marginRight: "0.5rem" }} />
        <Text>{props.label}</Text>
      </HStack>
    </components.Option>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption>) => {
  return (
    <components.Control {...props}>
      <MapPin size={"16.7px"} />
      {children}
    </components.Control>
  )
}

const Input = ({ children, ...props }: InputProps) => {
  return (
    <components.Input {...props} aria-label="type here to search addresses">
      {children}
    </components.Input>
  )
}
