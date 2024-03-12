import { Flex, FormControl, FormLabel, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { debounce } from "lodash"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select, { ControlProps, InputProps, OptionProps, components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TSitesSelectProps = {
  setSiteSelected: (boolean) => void
  fetchOptions: (address?: string, pid?: string) => Promise<IOption[]>
  onChange: (option: IOption) => void
  selectedOption: IOption
  pidName?: string
  siteName?: string
} & Partial<TAsyncSelectProps>

// Please be advised that this is expected to be used within a form context!

export const SitesSelect = observer(function ({
  fetchOptions,
  onChange,
  selectedOption,
  stylesToMerge,
  setSiteSelected,
  pidName = "pid",
  siteName = "site",
  ...rest
}: TSitesSelectProps) {
  const { geocoderStore } = useMst()
  const [pidOptions, setPidOptions] = useState<IOption<string>[]>([])
  const { fetchPids, fetchingPids } = geocoderStore
  const pidSelectRef = useRef(null)

  const { setValue, control, watch, reset } = useFormContext()
  const pidWatch = watch(pidName)
  const siteWatch = watch(siteName)
  const { t } = useTranslation()

  const fetchSiteOptions = (address: string, callback: (options) => void) => {
    if (address.length > 3) {
      fetchOptions(address).then((options: IOption[]) => {
        reset()
        callback(options)
      })
    } else callback([])
  }

  const handleChange = (option: IOption) => {
    setPidOptions([])
    onChange(option)
    setValue(pidName, null)
    if (option) {
      fetchPids(option.value).then((pids: string[]) => {
        setPidOptions(pids.map((pid) => ({ value: pid, label: pid })))
      })
    }
    const selectControl = pidSelectRef.current.controlRef
    if (selectControl) {
      selectControl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    }
  }

  const debouncedFetchOptions = useCallback(debounce(fetchSiteOptions, 1000), [])

  useEffect(() => {
    setSiteSelected(!!pidWatch || !!(!fetchingPids && siteWatch && R.isEmpty(pidOptions)))
  }, [pidWatch, siteWatch, pidOptions, fetchingPids])

  return (
    <Flex direction={{ base: "column", md: "row" }} bg="greys.grey03" px={6} py={2} gap={4}>
      <FormControl>
        <FormLabel>{t("permitApplication.addressLabel")}</FormLabel>
        <InputGroup>
          <AsyncSelect<IOption, boolean>
            isClearable={true}
            onChange={handleChange}
            placeholder="Search Addresses"
            value={selectedOption}
            defaultValue={selectedOption}
            components={{
              Control,
              Option,
              Input,
            }}
            stylesToMerge={{
              control: {
                borderRadius: "4px",
                paddingInline: "0.75rem",
                height: "40px",
              },
              menu: {
                width: "100%",
                background: "var(--chakra-colors-greys-grey10)",
              },
              ...stylesToMerge,
            }}
            defaultOptions
            loadOptions={debouncedFetchOptions}
            closeMenuOnSelect={true}
            isCreatable={false}
            {...rest}
          />
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel>{t("permitApplication.pidLabel")}</FormLabel>
        <InputGroup>
          <Flex w="full" direction="column">
            <Controller
              name={pidName}
              control={control}
              rules={{
                required:
                  pidOptions.length > 0 ? t("ui.isRequired", { field: t("permitApplication.pidLabel") }) : false,
              }}
              render={({ field: { onChange, value } }) => {
                return (
                  <Select
                    options={pidOptions}
                    ref={pidSelectRef}
                    value={pidOptions.find((option) => option.value === value) ?? { label: null, value: null }}
                    onChange={(option) => {
                      onChange(option.value)
                    }}
                  />
                )
              }}
            />
          </Flex>
        </InputGroup>
      </FormControl>
    </Flex>
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
