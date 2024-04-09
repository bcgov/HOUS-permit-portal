import { Button, Heading, Text, useDisclosure } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { ControlProps, OptionProps, components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IContact, IOption } from "../../../../types/types"
import { CreateContactModal } from "../../contact/create-contact-modal"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TContactsSelectProps = {
  onChange: (option: IOption<IContact> | null) => void
  selectedOption?: IOption<IContact>
} & Partial<TAsyncSelectProps<IOption<IContact>>>

export const ContactSelect = observer(({ onChange, selectedOption, stylesToMerge, ...rest }: TContactsSelectProps) => {
  const { contactStore } = useMst()
  const { fetchContactOptions: fetchOptions } = contactStore

  const { t } = useTranslation()
  const disclosureMethods = useDisclosure()
  const { isOpen, onOpen, onClose } = disclosureMethods

  const handleCreate = () => {
    onOpen()
  }

  const fetchContactOptions = useCallback(
    debounce((inputValue: string, callback: (options: IOption<IContact>[]) => void) => {
      fetchOptions(inputValue).then(callback)
    }, 400),
    []
  )

  return (
    <>
      <AsyncSelect<IOption<IContact>, false>
        isClearable={true}
        onChange={(option: IOption<IContact> | null) => onChange(option)} // Updated to handle single selection
        placeholder={t("ui.typeToSearch")}
        value={selectedOption}
        components={{ Control, Option }}
        stylesToMerge={{
          container: {
            width: "75%",
            paddingTop: "2px",
          },
          control: {
            height: undefined,
            paddingInline: "0.75rem",
            width: "100%",
          },
          menu: {
            width: "100%",
            background: "var(--chakra-colors-gray-50)",
          },
          ...stylesToMerge,
        }}
        loadOptions={fetchContactOptions}
        closeMenuOnSelect={true} // Set true for closing menu after selection
        isCreatable={true}
        onCreateOption={handleCreate} // Handle new option creation
        formatCreateLabel={(inputValue: string) => t("contact.createButton")} // Always hide the "Create" option
        {...rest}
      />
      <Button onClick={handleCreate} leftIcon={<Plus />} variant="primary" w="25%">
        {t("contact.create")}
      </Button>
      <CreateContactModal
        isOpen={isOpen}
        onClose={onClose}
        onCreate={(contact) => onChange({ label: "", value: contact })}
      />
    </>
  )
})

const Option = (props: OptionProps<IOption<IContact>>) => {
  const label = props.label
  const value = props.data.value
  return (
    <components.Option {...props}>
      <Heading size="md" color="text.link">
        {label}
      </Heading>
      <Text size="md" color="text.secondary">
        {value.professionalAssociation ?? value.businessName ?? value.organization ?? value.department}
      </Text>
    </components.Option>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption<IContact>>) => {
  return <components.Control {...props}>{children}</components.Control>
}
