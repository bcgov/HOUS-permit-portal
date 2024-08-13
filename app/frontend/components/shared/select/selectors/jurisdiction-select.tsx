import { HStack, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, OptionProps, StylesConfig, components } from "react-select"
import { IJurisdiction } from "../../../../models/jurisdiction"
import { useMst } from "../../../../setup/root"
import { IJurisdictionFilters, IOption } from "../../../../types/types"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TJurisdictionSelectProps = {
  onChange: (option: IOption<IJurisdiction>) => void
  onFetch?: () => void
  selectedOption: IOption<IJurisdiction>
  title?: string
  filters?: IJurisdictionFilters
} & Partial<TAsyncSelectProps>

export const JurisdictionSelect = observer(function ({
  onChange,
  onFetch,
  selectedOption,
  stylesToMerge,
  title,
  components = {},
  filters = {},
  ...rest
}: TJurisdictionSelectProps) {
  const { jurisdictionStore } = useMst()
  const { fetchJurisdictionOptions: fetchOptions } = jurisdictionStore

  const { t } = useTranslation()

  const fetchJurisdictionOptions = (name: string, callback: (options) => void) => {
    if (name.length > 3 || !R.isEmpty(filters)) {
      fetchOptions(!R.isEmpty(name) ? { name, ...filters } : filters).then((options: IOption<IJurisdiction>[]) => {
        onFetch && onFetch()
        callback(options)
      })
    } else callback([])
  }

  const debouncedFetchOptions = useCallback(debounce(fetchJurisdictionOptions, 1000), [])

  const customStyles: StylesConfig<IOption<IJurisdiction>, boolean> = {
    container: (provided) => ({
      ...provided,
      padding: 0,
      width: "100%", // This will make the container have a width of 100%
      ...(stylesToMerge?.container ?? {}),
    }),
    control: (provided) => ({
      ...provided,
      borderRadius: "4px",
      paddingInline: "0.75rem",
      height: "40px",
      width: "100%", // Ensure the control also takes up 100% width
      ...(stylesToMerge?.control ?? {}),
    }),
    menu: (provided) => ({
      ...provided,
      width: "100%", // Ensure the menu matches the width of the control/container
      background: "var(--chakra-colors-greys-grey10)",
      ...(stylesToMerge?.menu ?? {}),
    }),
    input: (provided) => ({
      ...provided,
      display: "flex",
      ...(stylesToMerge?.input ?? {}),
    }),
    valueContainer: (provided) => ({
      ...provided,
      ...(stylesToMerge?.valueContainer ?? {}),
    }),
  }

  return (
    <AsyncSelect<IOption<IJurisdiction>, boolean>
      onChange={(option: IOption<IJurisdiction>) => {
        onChange(option?.value)
      }}
      value={selectedOption}
      components={{
        Control,
        Option,
        Input,
        ...components,
      }}
      styles={customStyles}
      loadOptions={debouncedFetchOptions}
      isCreatable={false}
      isClearable
      defaultOptions
      placeholder={t("ui.typeToSearch")}
      {...rest}
    />
  )
})

const Option = (props: OptionProps<IOption<IJurisdiction>>) => {
  return (
    <components.Option {...props}>
      <HStack color={"text.secondary"} fontSize={"xs"}>
        <MapPin size={"12px"} style={{ marginRight: "0.5rem" }} />
        <Text>{props.label}</Text>
      </HStack>
    </components.Option>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption<IJurisdiction>>) => {
  return (
    <components.Control {...props}>
      <MapPin color={"text.secondary"} size={"16.7px"} />
      {children}
    </components.Control>
  )
}

const Input = ({ children, style, ...props }: InputProps) => {
  return (
    <components.Input {...props} aria-label="type here to search jurisdictions">
      {children}
    </components.Input>
  )
}
