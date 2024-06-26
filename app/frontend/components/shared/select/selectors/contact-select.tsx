import { Box, Button, Flex, Heading, Text, useDisclosure } from "@chakra-ui/react"
import { MagnifyingGlass, Pencil, Plus } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, MenuProps, OptionProps, components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IContact, IOption } from "../../../../types/types"
import { SharedSpinner } from "../../base/shared-spinner"
import { CreateEditContactModal } from "../../contact/create-edit-contact-modal"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TContactsSelectProps = {
  onChange: (option: IOption<IContact> | null) => void
  selectedOption?: IOption<IContact>
} & Partial<TAsyncSelectProps<IOption<IContact>>>

export const ContactSelect = observer(({ onChange, selectedOption, stylesToMerge, ...rest }: TContactsSelectProps) => {
  const { contactStore } = useMst()
  const { fetchContactOptions: fetchOptions } = contactStore

  const [editingContact, setEditingContact] = React.useState<IContact | null>(null)

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

  const [defaultOptions, setDefaultOptions] = useState<IOption<IContact>[]>([])

  const resetOptions = () => {
    fetchContactOptions(null, (result) => {
      setDefaultOptions(result)
    })
  }

  useEffect(() => {
    resetOptions()
  }, [])

  const onDestroy = () => {
    resetOptions()
  }

  const onCreateOrUpdate = (updatedContact) => {
    if (!editingContact) {
      onChange({ label: "", value: updatedContact })
    } else {
      setEditingContact(null)
      resetOptions()
    }
  }

  return (
    <>
      <AsyncSelect<IOption<IContact>, false>
        isClearable={true}
        onChange={(option: IOption<IContact> | null) => onChange(option)} // Updated to handle single selection
        placeholder={t("ui.typeToSearch")}
        value={selectedOption}
        components={{
          Control,
          Option: (props) => (
            <Option
              {...props}
              onClickEdit={(value) => {
                setEditingContact(value)
                onOpen()
              }}
            />
          ),
          Input,
          Menu,
        }}
        stylesToMerge={{
          container: {
            width: "72%",
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
        defaultOptions={defaultOptions}
        closeMenuOnSelect={true} // Set true for closing menu after selection
        menuIsOpen
        isCreatable={false}
        {...rest}
      />
      <Button onClick={handleCreate} leftIcon={<Plus />} variant="primary" w="28%" px={2}>
        {t("contact.create")}
      </Button>
      <CreateEditContactModal
        isOpen={isOpen}
        onClose={() => {
          setEditingContact(null)
          onClose()
        }}
        contact={editingContact}
        onDestroy={onDestroy}
        onCreateOrUpdate={onCreateOrUpdate}
      />
    </>
  )
})

interface IOptionComponentProps extends OptionProps<IOption<IContact>> {
  onClickEdit: (IContact) => void
}

const Option = ({ onClickEdit, ...props }: IOptionComponentProps) => {
  const { t } = useTranslation()
  const {
    label,
    data: { value },
  } = props

  return (
    <components.Option {...props}>
      <Flex align="center" justifyContent="space-between">
        <Box>
          <Heading size="sm">{label}</Heading>
          <Text size="sm" color="text.secondary">
            {value.professionalAssociation ?? value.businessName ?? value.organization ?? value.department}
          </Text>
        </Box>
        <Flex direction="column" maxW={"72px"} align="flex-end">
          <Button
            w="full"
            onClick={(e) => {
              e.stopPropagation()
              onClickEdit(value)
            }}
            leftIcon={<Pencil />}
            variant="link"
            px={2}
          >
            {t("ui.edit")}
          </Button>
        </Flex>
      </Flex>
    </components.Option>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption<IContact>>) => {
  return (
    <components.Control {...props}>
      <MagnifyingGlass size={"16.7px"} />
      {children}
    </components.Control>
  )
}

const Input = ({ children, style, ...props }: InputProps) => {
  const { t } = useTranslation()
  return (
    <components.Input {...props} autoFocus aria-label="type here to search contacts" placeholder={t("ui.typeToSearch")}>
      {children}
    </components.Input>
  )
}

const Menu = observer(({ children, ...props }: MenuProps) => {
  const { contactStore } = useMst()
  const { isContactsLoading } = contactStore
  return <components.Menu {...props}>{isContactsLoading ? <SharedSpinner ml="45%" /> : children}</components.Menu>
})
