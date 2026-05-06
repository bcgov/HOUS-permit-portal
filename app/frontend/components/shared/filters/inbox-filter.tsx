import { Radio, RadioGroup } from "@/components/ui/radio"
import { Badge, Button, Checkbox, HStack, Popover, Separator, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../types/types"

interface IInboxFilterProps {
  title: string
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

interface IUnreadBadgeProps {
  count?: number
}

export function UnreadBadge({ count }: IUnreadBadgeProps) {
  if (count == null || count <= 0) return null

  return (
    <Badge bg="theme.blueActive" color="white" borderRadius="full" px={2} fontSize="xs" minW="20px" textAlign="center">
      {count}
    </Badge>
  )
}

export const InboxFilter = observer(function InboxFilter({
  title,
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
  const { open, onOpen, onClose } = useDisclosure()
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
    <Popover.Root
      open={!isDisabled && isOpen}
      closeOnInteractOutside
      onOpenChange={(e) => {
        if (e.open) {
          ;(isDisabled ? undefined : onOpen)()
        } else {
          onClose()
        }
      }}
      positioning={{
        placement: "bottom-start",
      }}
    >
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          bg={hasSelection ? "background.blueLight" : undefined}
          borderColor={hasSelection ? "theme.blueActive" : undefined}
          size="sm"
          fontWeight="normal"
          disabled={isDisabled}
          opacity={isDisabled ? 0.5 : 1}
        >
          <HStack gap={2}>
            <Text>{title}</Text>
            {showSelectionParens && (
              <Text as="span" fontSize="sm">
                ({selectedCheckboxCount})
              </Text>
            )}
            {showResultsBadge && <UnreadBadge count={badgeCount} />}
          </HStack>
          <CaretDown />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w="auto" minW="200px" p={4} zIndex="dropdown">
          <Popover.Body p={0}>
            <VStack align="start" gap={3}>
              {isMulti ? (
                <>
                  <Checkbox.Root
                    onCheckedChange={handleSelectAll}
                    checked={
                      Array.isArray(localValue) && localValue.length > 0 && localValue.length < options.length
                        ? "indeterminate"
                        : Array.isArray(localValue) && localValue.length === options.length && options.length > 0
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>{t("ui.selectAll")}</Checkbox.Label>
                  </Checkbox.Root>
                  {options.map((option) => (
                    <Checkbox.Root
                      key={option.value}
                      onCheckedChange={() => handleCheckboxToggle(option.value)}
                      checked={Array.isArray(localValue) && localValue.includes(option.value)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>{option.label}</Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                  <Separator />
                  <HStack w="full" justifyContent="space-between">
                    <Button variant="plain" size="sm" onClick={handleClear}>
                      {t("ui.clear")}
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleApply}>
                      {t("ui.apply")}
                    </Button>
                  </HStack>
                </>
              ) : (
                <>
                  <RadioGroup.Root
                    value={typeof localValue === "string" ? localValue : ""}
                    onValueChange={(val) => setLocalValue(val)}
                  >
                    <VStack align="start" gap={3}>
                      {options.map((option) => (
                        <Radio key={option.value} value={option.value}>
                          {option.label}
                        </Radio>
                      ))}
                    </VStack>
                  </RadioGroup.Root>
                  <Separator />
                  <Button variant="primary" size="sm" w="full" onClick={handleApply}>
                    {t("ui.apply")}
                  </Button>
                </>
              )}
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
})
