import { Button, FormControl, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { ControlProps, InputProps, OptionProps, StylesConfig, components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TSitesSelectProps = {
  onChange: (option: IOption) => void
  value: IOption
  addressName?: string
  onButtonClick: () => void
  isButtonDisabled: boolean
  buttonText: string
} & Partial<TAsyncSelectProps>

export const StepCodeLookupAddressSelect = observer(function ({
  onChange,
  value,
  stylesToMerge,
  addressName = "address",
  onButtonClick,
  isButtonDisabled,
  buttonText,
  ...rest
}: TSitesSelectProps) {
  const { geocoderStore } = useMst()
  const { fetchSiteOptions: fetchOptions } = geocoderStore

  const { setValue } = useFormContext()
  const { t } = useTranslation()
  const location = useLocation()

  const isHomePage = location.pathname === "/welcome"
  const placeholderText = isHomePage ? t("ui.projectAddress") : t("ui.enterAddress")

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
      width: "100%",
    }),
    control: (provided) => ({
      ...provided,
      borderRadius: "4px",
      paddingInline: "0.75rem",
      height: "75px",
      width: "57%",
    }),
    valueContainer: (provided) => ({
      ...provided,
      display: "flex",
      flexWrap: "nowrap",
      position: "relative",
    }),
    menu: (provided) => ({
      ...provided,
      width: "57%",
      background: "var(--chakra-colors-greys-grey10)",
    }),
    placeholder: (base) => ({
      ...base,
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
  }
  return (
    <FormControl w="full" zIndex={2}>
      <InputGroup w="full">
        <AsyncSelect<IOption, boolean>
          isClearable={true}
          onChange={onChange}
          placeholder={placeholderText}
          value={value}
          defaultValue={value}
          components={{
            Control: (props) => (
              <Control
                {...props}
                onButtonClick={onButtonClick}
                isButtonDisabled={isButtonDisabled}
                buttonText={buttonText}
              />
            ),
            Option,
            Input: (props) => <Input {...props} aria-label={placeholderText} />,
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

const Control = ({
  children,
  onButtonClick,
  isButtonDisabled,
  buttonText,
  ...props
}: ControlProps<IOption> & { onButtonClick: () => void; isButtonDisabled: boolean; buttonText: string }) => {
  return (
    <components.Control {...props}>
      {children}
      <Button variant="primary" size="lg" onClick={onButtonClick} pt="6" pb="6" pl="3" pr="3" zIndex={10}>
        {buttonText}
      </Button>
    </components.Control>
  )
}

const Input = ({ children, ...props }: InputProps) => {
  return <components.Input {...props}>{children}</components.Input>
}
