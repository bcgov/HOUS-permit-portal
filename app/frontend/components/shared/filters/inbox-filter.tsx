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
  Portal,
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
import {
  filterGroupSelectionState,
  groupFilterOptions,
  shouldShowFilterGroupLabels,
  toggleFilterGroupValues,
} from "../../../utils/group-filter-options"
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
  const selectedValues = Array.isArray(value) ? value : []

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
    ? selectedValues.length > 0
    : typeof value === "string" && !!value && value !== options?.[0]?.value

  const showSelectionParens = isMulti && selectedValues.length >= 1

  const commit = (next: string | string[]) => {
    onChange(next)
    onApply()
  }

  const handleClear = () => {
    const cleared = isMulti ? [] : options?.[0]?.value || ""
    onChange(cleared)
    onClear?.()
    onClose()
  }

  const handleCheckboxToggle = (optionValue: string) => {
    const next = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]
    commit(next)
  }

  const handleSelectAll = () => {
    const allValues = options.map((o) => o.value)
    commit(selectedValues.length === options.length ? [] : allValues)
  }

  const handleSelectGroup = (groupValues: string[]) => {
    commit(toggleFilterGroupValues(selectedValues, groupValues))
  }

  const groupedOptions = groupFilterOptions(options, t("siteConfiguration.templateCategories.uncategorized"))
  const showGroupLabels = shouldShowFilterGroupLabels(groupedOptions)

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
                ({selectedValues.length})
              </Text>
            )}
            {showResultsBadge && <UnreadBadge count={badgeCount} />}
          </HStack>
        </Button>
      </PopoverTrigger>
      <Portal>
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
                  isChecked={selectedValues.length === options.length && options.length > 0}
                  isIndeterminate={selectedValues.length > 0 && selectedValues.length < options.length}
                  onChange={handleSelectAll}
                >
                  {t("ui.selectAll")}
                </Checkbox>
                <Box overflowY="auto" minH={0} flex={1}>
                  <VStack align="stretch" spacing={4}>
                    {groupedOptions.map((group) => {
                      const groupValues = group.options.map((option) => option.value)
                      const { isChecked, isIndeterminate } = filterGroupSelectionState(selectedValues, groupValues)

                      return (
                        <VStack key={group.id} align="start" spacing={3}>
                          {showGroupLabels && (
                            <Checkbox
                              isChecked={isChecked}
                              isIndeterminate={isIndeterminate}
                              onChange={() => handleSelectGroup(groupValues)}
                            >
                              <Text fontSize="sm" fontWeight="bold" color="text.secondary">
                                {group.label}
                              </Text>
                            </Checkbox>
                          )}
                          {group.options.map((option) => (
                            <Checkbox
                              key={option.value}
                              pl={showGroupLabels ? 6 : 0}
                              isChecked={selectedValues.includes(option.value)}
                              onChange={() => handleCheckboxToggle(option.value)}
                            >
                              {option.label}
                            </Checkbox>
                          ))}
                        </VStack>
                      )
                    })}
                  </VStack>
                </Box>
                <Divider />
                <HStack w="full" justifyContent="space-between">
                  <Button variant="link" size="sm" onClick={handleClear}>
                    {t("ui.clear")}
                  </Button>
                  <Button variant="primary" size="sm" onClick={onClose}>
                    {t("ui.apply")}
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3} flex={1} minH={0} overflow="hidden">
                <Box overflowY="auto" minH={0} flex={1}>
                  <RadioGroup
                    value={typeof value === "string" ? value : ""}
                    onChange={(val) => {
                      commit(val)
                      onClose()
                    }}
                  >
                    <VStack align="stretch" spacing={4}>
                      {groupedOptions.map((group) => (
                        <VStack key={group.id} align="start" spacing={3}>
                          {showGroupLabels && (
                            <Text fontSize="sm" fontWeight="bold" color="text.secondary">
                              {group.label}
                            </Text>
                          )}
                          {group.options.map((option) => (
                            <Radio key={option.value} value={option.value}>
                              {option.label}
                            </Radio>
                          ))}
                        </VStack>
                      ))}
                    </VStack>
                  </RadioGroup>
                </Box>
                <Divider />
                <Button variant="primary" size="sm" w="full" onClick={onClose}>
                  {t("ui.apply")}
                </Button>
              </VStack>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
