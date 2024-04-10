import { FormControl, FormLabel, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, OptionProps, StylesConfig, components } from "react-select"
import { IJurisdiction } from "../../../../models/jurisdiction"
import { useMst } from "../../../../setup/root"
import { EJurisdictionTypes } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TJurisdictionSelectProps = {
  onChange: (option: IOption<IJurisdiction>) => void
  selectedOption: IOption<IJurisdiction>
  title?: string
  jurisdictionName?: string
  jurisdictionType?: EJurisdictionTypes
} & Partial<TAsyncSelectProps>

// Please be advised that this is expected to be used within a form context!

export const JurisdictionSelect = observer(function ({
  onChange,
  selectedOption,
  stylesToMerge,
  title,
  jurisdictionName = "jurisdiction",
  jurisdictionType = null,
  ...rest
}: TJurisdictionSelectProps) {
  const { jurisdictionStore } = useMst()
  const { fetchJurisdictionOptions: fetchOptions } = jurisdictionStore

  const { setValue } = useFormContext()
  const { t } = useTranslation()

  const fetchJurisdictionOptions = (name: string, callback: (options) => void) => {
    if (name.length > 3) {
      fetchOptions(name, jurisdictionType).then((options: IOption<IJurisdiction>[]) => {
        setValue(jurisdictionName, null)
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
    input: (provided) => ({
      ...provided,
      display: "flex",
    }),
    // Add other custom styles as needed
  }

  return (
    <FormControl w="full">
      <FormLabel>{title ?? t("jurisdiction.index.title")}</FormLabel>
      <InputGroup w="full">
        <AsyncSelect<IOption<IJurisdiction>, boolean>
          isClearable={true}
          onChange={(option: IOption<IJurisdiction>) => {
            onChange(option.value)
          }}
          value={selectedOption}
          defaultValue={null}
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
    </FormControl>
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
      <MapPin size={"16.7px"} />
      {children}
    </components.Control>
  )
}

const Input = ({ children, style, ...props }: InputProps) => {
  const { t } = useTranslation()
  return (
    <components.Input {...props} placeholder={t("ui.typeToSearch")} aria-label="type here to search jurisdictions">
      {children}
    </components.Input>
  )
}
