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
} & Partial<TAsyncSelectProps>

export const SitesSelect = observer(
  ({ fetchOptions, onChange, selectedOption, stylesToMerge, setSiteSelected, ...rest }: TSitesSelectProps) => {
    const { geocoderStore } = useMst()
    const [pidOptions, setPidOptions] = useState<IOption<string>[]>([])
    const { fetchPids } = geocoderStore
    const pidSelectRef = useRef(null)

    const fetchSiteOptions = (address: string, callback: (options) => void) => {
      if (address.length > 3) {
        fetchOptions(address).then((options: IOption[]) => {
          callback(options)
        })
      } else callback([])
    }

    const { setValue, control, watch } = useFormContext()
    const pidWatch = watch("pid")
    const siteWatch = watch("site")
    const { t } = useTranslation()

    const handleChange = (option: IOption) => {
      onChange(option)
      if (option) {
        fetchPids(option.value).then((pids: string[]) => {
          setPidOptions(pids.map((pid) => ({ value: pid, label: pid })))
        })
      }
      setValue("pid", null)
      const selectControl = pidSelectRef.current.controlRef
      if (selectControl) {
        selectControl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
      }
    }

    const debouncedFetchOptions = useCallback(debounce(fetchSiteOptions, 1000), [])

    useEffect(() => {
      setSiteSelected(!!pidWatch || !!(siteWatch && R.isEmpty(pidOptions)))
    }, [pidWatch, siteWatch, pidOptions])

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
                name="pid"
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
                      value={pidOptions.find((option) => option.value === value?.value)}
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
  }
)

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
