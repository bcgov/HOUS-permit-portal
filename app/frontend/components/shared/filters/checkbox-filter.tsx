import { InputGroup } from "@/components/ui/input-group"
import {
  Button,
  Checkbox,
  Input,
  InputElement,
  Menu,
  Portal,
  Separator,
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
    <Menu.Root
      open={isMenuOpen}
      onOpen={() => setIsMenuOpen(true)}
      onClose={() => setIsMenuOpen(false)}
      closeOnSelect={false}
    >
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          bg={hasSelection ? "background.blueLight" : undefined}
          _expanded={{ bg: "background.blueLight" }}
        >
          {title}
          <CaretDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <VStack align="start" gap={4}>
              <InputGroup>
                <InputElement pointerEvents="none">
                  <MagnifyingGlass />
                </InputElement>
                <Input
                  placeholder={t("ui.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Separator />
              {filteredOptions.length === 0 ? (
                <Text color="greys.grey01" fontSize="sm" px={2} w="full" textAlign="center">
                  {t("ui.noOptionsFound")}
                </Text>
              ) : (
                filteredOptions.map((option) => {
                  const checkboxProps = getCheckboxProps({ value: option.value })
                  return (
                    <Checkbox.Root key={option.value} {...checkboxProps}>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>{option.label}</Checkbox.Label>
                    </Checkbox.Root>
                  )
                })
              )}
              <Separator />
              <Button
                onClick={onReset}
                variant="primary"
                size="sm"
                alignSelf="center"
                w="full"
                disabled={!value || value.length === 0}
              >
                {t("ui.reset")}
              </Button>
            </VStack>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
})
