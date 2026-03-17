import {
  Badge,
  Button,
  Checkbox,
  Divider,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../types/types"

interface IInboxFilterProps {
  title: string
  badgeCount?: number
  isMulti: boolean
  value: string | string[]
  onChange: (value: string | string[]) => void
  options?: IOption[]
  loadOptions?: () => Promise<IOption[]>
  onApply: () => void
  onClear?: () => void
}

export const InboxFilter = observer(function InboxFilter({
  title,
  badgeCount,
  isMulti,
  value,
  onChange,
  options: staticOptions,
  loadOptions,
  onApply,
  onClear,
}: IInboxFilterProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [options, setOptions] = useState<IOption[]>(staticOptions || [])
  const [localValue, setLocalValue] = useState<string | string[]>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [JSON.stringify(value)])

  useEffect(() => {
    if (staticOptions) {
      setOptions(staticOptions)
    }
  }, [staticOptions])

  useEffect(() => {
    if (loadOptions && isOpen) {
      loadOptions().then((loaded) => setOptions(loaded))
    }
  }, [isOpen])

  const hasSelection = isMulti
    ? Array.isArray(localValue) && localValue.length > 0
    : !!localValue && localValue !== options?.[0]?.value

  const handleApply = () => {
    onChange(localValue)
    onApply()
    onClose()
  }

  const handleClear = () => {
    const cleared = isMulti ? [] : options?.[0]?.value || ""
    setLocalValue(cleared)
    onChange(cleared)
    onClear?.()
    onClose()
  }

  const handleCheckboxToggle = (optionValue: string) => {
    const current = Array.isArray(localValue) ? localValue : []
    const next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]
    setLocalValue(next)
  }

  const handleSelectAll = () => {
    const allValues = options.map((o) => o.value)
    const current = Array.isArray(localValue) ? localValue : []
    if (current.length === options.length) {
      setLocalValue([])
    } else {
      setLocalValue(allValues)
    }
  }

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom-start" closeOnBlur>
      <PopoverTrigger>
        <Button
          variant="outline"
          rightIcon={<CaretDown />}
          bg={hasSelection ? "background.blueLight" : undefined}
          size="sm"
          fontWeight="normal"
        >
          <HStack spacing={2}>
            <Text>{title}</Text>
            {badgeCount != null && badgeCount > 0 && (
              <Badge
                bg="theme.blueActive"
                color="white"
                borderRadius="full"
                px={2}
                fontSize="xs"
                minW="20px"
                textAlign="center"
              >
                {badgeCount}
              </Badge>
            )}
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent w="auto" minW="200px" p={4} zIndex="dropdown">
        <PopoverBody p={0}>
          <VStack align="start" spacing={3}>
            {isMulti ? (
              <>
                <Checkbox
                  isChecked={Array.isArray(localValue) && localValue.length === options.length && options.length > 0}
                  isIndeterminate={
                    Array.isArray(localValue) && localValue.length > 0 && localValue.length < options.length
                  }
                  onChange={handleSelectAll}
                >
                  {t("ui.selectAll")}
                </Checkbox>
                {options.map((option) => (
                  <Checkbox
                    key={option.value}
                    isChecked={Array.isArray(localValue) && localValue.includes(option.value)}
                    onChange={() => handleCheckboxToggle(option.value)}
                  >
                    {option.label}
                  </Checkbox>
                ))}
                <Divider />
                <HStack w="full" justifyContent="space-between">
                  <Button variant="link" size="sm" onClick={handleClear}>
                    {t("ui.clear")}
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleApply}>
                    {t("ui.apply")}
                  </Button>
                </HStack>
              </>
            ) : (
              <>
                <RadioGroup
                  value={typeof localValue === "string" ? localValue : ""}
                  onChange={(val) => setLocalValue(val)}
                >
                  <VStack align="start" spacing={3}>
                    {options.map((option) => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>
                <Divider />
                <Button variant="primary" size="sm" w="full" onClick={handleApply}>
                  {t("ui.apply")}
                </Button>
              </>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})
