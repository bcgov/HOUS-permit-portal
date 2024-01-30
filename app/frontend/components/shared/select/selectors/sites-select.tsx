import { Input as ChakraInput, Flex, FormControl, FormLabel, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { debounce } from "lodash"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, OptionProps, components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TSitesSelectProps = {
  fetchOptions: (query: string) => Promise<IOption[]>
  onChange: (option: IOption) => void
  selectedOption: IOption
} & Partial<TAsyncSelectProps>

export const SitesSelect = observer(
  ({ fetchOptions, onChange, selectedOption, stylesToMerge, ...rest }: TSitesSelectProps) => {
    const { geocoderStore } = useMst()
    const { fetchPid } = geocoderStore

    const fetchSiteOptions = (address: string, callback: (options) => void) => {
      if (address.length > 3) {
        fetchOptions(address).then((options: IOption[]) => {
          callback(options)
        })
      } else callback([])
    }

    const { register, setValue } = useFormContext()
    const { t } = useTranslation()

    const handleChange = (option: IOption) => {
      onChange(option)
      if (option) {
        fetchPid(option.value).then((pid: string) => {
          setValue("pid", pid)
        })
      } else {
        setValue("pid", null)
      }
    }

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
              <ChakraInput
                {...register("pid", {
                  required: true,
                })}
                disabled
                bg="greys.white"
                type={"text"}
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
