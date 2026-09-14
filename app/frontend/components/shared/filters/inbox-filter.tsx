import {
  Box,
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
import { UnreadBadge } from "../base/unread-badge"

interface IInboxFilterProps {
  title: string
  leftIcon?: React.ReactNode
  /** Unread (or similar) result count — only rendered when `showResultsBadge` is true. */
  badgeCount?: number
  /** When true, `badgeCount` is shown as the blue results pill (unread filter only). */
  showResultsBadge?: boolean
  isMulti: boolean
  value: string | string[]
  onChange: (value: string | string[]) => void
  options?: IOption[]
  loadOptions?: () => Promise<IOption[]>
  onApply: () => void
  onClear?: () => void
  isDisabled?: boolean
}

export const InboxFilter = observer(function InboxFilter({
  title,
  leftIcon,
  badgeCount,
  showResultsBadge,
  isMulti,
  value,
  onChange,
  options: staticOptions,
  loadOptions,
  onApply,
  onClear,
  isDisabled,
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

  const selectedCheckboxCount = isMulti && Array.isArray(localValue) ? localValue.length : 0
  const showSelectionParens = isMulti && selectedCheckboxCount >= 1

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
    <Popover
      isOpen={!isDisabled && isOpen}
      onOpen={isDisabled ? undefined : onOpen}
      onClose={onClose}
      placement="bottom-start"
      closeOnBlur
    >
      <PopoverTrigger>
        <Button
          variant="secondary"
          rightIcon={<CaretDown />}
          bg={hasSelection ? "background.blueLight" : undefined}
          borderColor={hasSelection ? "theme.blueActive" : undefined}
          size="sm"
          fontWeight="normal"
          isDisabled={isDisabled}
          opacity={isDisabled ? 0.5 : 1}
        >
          <HStack spacing={2}>
            {leftIcon}
            <Text>{title}</Text>
            {showSelectionParens && (
              <Text as="span" fontSize="sm">
                ({selectedCheckboxCount})
              </Text>
            )}
            {showResultsBadge && <UnreadBadge count={badgeCount} />}
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w="auto"
        minW="200px"
        p={4}
        zIndex="dropdown"
        maxH="min(420px, calc(100vh - 96px))"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <PopoverBody p={0} display="flex" flexDirection="column" minH={0} overflow="hidden">
          {isMulti ? (
            <VStack align="stretch" spacing={3} flex={1} minH={0} overflow="hidden">
              <Checkbox
                isChecked={Array.isArray(localValue) && localValue.length === options.length && options.length > 0}
                isIndeterminate={
                  Array.isArray(localValue) && localValue.length > 0 && localValue.length < options.length
                }
                onChange={handleSelectAll}
              >
                {t("ui.selectAll")}
              </Checkbox>
              <Box overflowY="auto" minH={0} flex={1}>
                <VStack align="start" spacing={3}>
                  {options.map((option) => (
                    <Checkbox
                      key={option.value}
                      isChecked={Array.isArray(localValue) && localValue.includes(option.value)}
                      onChange={() => handleCheckboxToggle(option.value)}
                    >
                      {option.label}
                    </Checkbox>
                  ))}
                </VStack>
              </Box>
              <Divider />
              <HStack w="full" justifyContent="space-between">
                <Button variant="link" size="sm" onClick={handleClear}>
                  {t("ui.clear")}
                </Button>
                <Button variant="primary" size="sm" onClick={handleApply}>
                  {t("ui.apply")}
                </Button>
              </HStack>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={3} flex={1} minH={0} overflow="hidden">
              <Box overflowY="auto" minH={0} flex={1}>
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
              </Box>
              <Divider />
              <Button variant="primary" size="sm" w="full" onClick={handleApply}>
                {t("ui.apply")}
              </Button>
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})
