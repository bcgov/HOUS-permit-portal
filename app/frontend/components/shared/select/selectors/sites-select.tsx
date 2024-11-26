import { Flex, FormControl, FormLabel, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, OptionProps, components } from "react-select"
import CreatableSelect from "react-select/creatable"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { formatPidLabel, formatPidValue } from "../../../../utils/utility-functions"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TSitesSelectProps = {
  onChange: (option: IOption) => void
  selectedOption: IOption
  pidName?: string
  siteName?: string
} & Partial<TAsyncSelectProps>

// Please be advised that this is expected to be used within a form context!

export const SitesSelect = observer(function ({
  onChange,
  selectedOption,
  stylesToMerge,
  pidName = "pid",
  siteName = "site",
  ...rest
}: TSitesSelectProps) {
  const { t } = useTranslation()
  const { geocoderStore } = useMst()
  const [pidOptions, setPidOptions] = useState<IOption<string>[]>([])
  const { fetchSiteOptions: fetchOptions, fetchPids, fetchingPids, fetchSiteDetailsFromPid } = geocoderStore
  const pidSelectRef = useRef(null)

  const { setValue, control, reset, watch } = useFormContext()

  const pidWatch = watch(pidName)
  const siteWatch = watch(siteName)

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
      //set the label for the address?
      fetchPids(option.value).then((pids: string[]) => {
        if (pids) {
          setPidOptions(pids.map((pid) => ({ value: pid, label: formatPidLabel(pid) })))
          const selectControl = pidSelectRef?.current?.controlRef
          if (selectControl && !R.isEmpty(pids)) {
            selectControl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
          }
        }
      })
    }
  }

  useEffect(() => {
    ;(async () => {
      if (R.isNil(siteWatch?.value) && pidWatch) {
        //the pid is valid, lets try to fill in the address based on the PID
        const siteDetails = await fetchSiteDetailsFromPid(pidWatch)
        if (siteDetails) {
          setValue(siteName, siteDetails)
        }
      }
    })()
  }, [siteWatch?.value, pidWatch])

  const debouncedFetchOptions = useCallback(debounce(fetchSiteOptions, 1000), [])

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
                  <CreatableSelect
                    // @ts-ignore
                    options={pidOptions}
                    ref={pidSelectRef}
                    value={{
                      label: formatPidLabel(value),
                      value: formatPidValue(value),
                    }}
                    onChange={(option) => {
                      if (!option) {
                        setValue(siteName, null)
                      }
                      onChange(formatPidValue(option?.value))
                    }}
                    onCreateOption={(inputValue: string) => {
                      const newValue = { label: formatPidLabel(inputValue), value: formatPidValue(inputValue) }
                      onChange(newValue.value)
                    }}
                    formatCreateLabel={(inputValue: string) =>
                      t("permitApplication.usePid", { inputValue: formatPidLabel(inputValue) })
                    }
                    isClearable
                    isSearchable
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
