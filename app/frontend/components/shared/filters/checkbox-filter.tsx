import {
  Box,
  Button,
  Checkbox,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useCheckboxGroup,
  VStack,
} from "@chakra-ui/react"
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

interface IOption {
  value: string
  label: string
}

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onReset: () => void
  options: IOption[]
  title: string
}

export const CheckboxFilter = observer(function CheckboxFilter({ value, onChange, onReset, options, title }: IProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const hasSelection = !!value && value.length > 0

  const filteredOptions = options.filter((option) => option.label?.toLowerCase().includes(searchTerm.toLowerCase()))

  const { getCheckboxProps } = useCheckboxGroup({
    value,
    onChange,
  })

  return (
    <Menu
      isOpen={isMenuOpen}
      onOpen={() => setIsMenuOpen(true)}
      onClose={() => setIsMenuOpen(false)}
      closeOnSelect={false}
    >
      <MenuButton
        as={Button}
        variant="secondary"
        rightIcon={<CaretDown />}
        bg={hasSelection ? "background.blueLight" : undefined}
        borderColor={hasSelection ? "theme.blueActive" : undefined}
        size="sm"
        fontWeight="normal"
        _expanded={{ bg: "background.blueLight" }}
      >
        {title}
      </MenuButton>
      <MenuList
        p={4}
        zIndex="dropdown"
        maxH="min(420px, calc(100vh - 96px))"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <VStack align="stretch" spacing={4} flex={1} minH={0} overflow="hidden">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <MagnifyingGlass />
            </InputLeftElement>
            <Input placeholder={t("ui.search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <Divider />
          <Box overflowY="auto" minH={0} flex={1} w="full">
            {filteredOptions.length === 0 ? (
              <Text color="greys.grey01" fontSize="sm" px={2} w="full" textAlign="center">
                {t("ui.noOptionsFound")}
              </Text>
            ) : (
              <VStack align="start" spacing={4}>
                {filteredOptions.map((option) => {
                  const checkboxProps = getCheckboxProps({ value: option.value })
                  return (
                    <Checkbox key={option.value} {...checkboxProps}>
                      {option.label}
                    </Checkbox>
                  )
                })}
              </VStack>
            )}
          </Box>
          <Divider />
          <Button
            onClick={onReset}
            variant="primary"
            size="sm"
            alignSelf="center"
            w="full"
            isDisabled={!value || value.length === 0}
          >
            {t("ui.reset")}
          </Button>
        </VStack>
      </MenuList>
    </Menu>
  )
})
