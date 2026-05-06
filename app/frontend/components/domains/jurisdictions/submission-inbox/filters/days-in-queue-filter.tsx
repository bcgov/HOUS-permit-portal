import {
  Button,
  HStack,
  NativeSelect,
  NumberInput,
  Popover,
  Separator,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface IDaysInQueueValue {
  operator: string
  days: number
}

interface IProps {
  value: IDaysInQueueValue | null
  onChange: (value: IDaysInQueueValue | null) => void
  onApply: () => void
  onClear: () => void
}

export const DaysInQueueFilter = observer(function DaysInQueueFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()
  const [localOperator, setLocalOperator] = useState<string>(value?.operator ?? "gte")
  const [localDays, setLocalDays] = useState<number>(value?.days ?? 0)

  useEffect(() => {
    setLocalOperator(value?.operator ?? "gte")
    setLocalDays(value?.days ?? 0)
  }, [value?.operator, value?.days])

  const hasSelection = value != null

  const handleApply = () => {
    if (localDays > 0) {
      onChange({ operator: localOperator, days: localDays })
      onApply()
    }
    onClose()
  }

  const handleClear = () => {
    setLocalOperator("gte")
    setLocalDays(0)
    onClear()
    onClose()
  }

  return (
    <Popover.Root
      open={open}
      closeOnInteractOutside
      onOpenChange={(e) => {
        if (e.open) {
          onOpen()
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
        >
          {/* @ts-ignore */}
          <Text>{t("submissionInbox.filters.daysInQueue")}</Text>
          <CaretDown />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w="auto" minW="240px" p={4} zIndex="dropdown">
          <Popover.Body p={0}>
            <VStack align="start" gap={3}>
              <NativeSelect.Root>
                <NativeSelect.Field
                  size="sm"
                  value={localOperator}
                  onValueChange={(e) => setLocalOperator(e.target.value)}
                >
                  {/* @ts-ignore */}
                  <option value="gte">{t("submissionInbox.filters.daysInQueueGte")}</option>
                  {/* @ts-ignore */}
                  <option value="lt">{t("submissionInbox.filters.daysInQueueLt")}</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <HStack gap={2}>
                <NumberInput.Root
                  size="sm"
                  min={0}
                  value={String(localDays)}
                  onValueChange={(_, val) => setLocalDays(isNaN(val) ? 0 : val)}
                  maxW="100px"
                >
                  <NumberInput.Input />
                  <NumberInput.Control>
                    <NumberInput.IncrementTrigger />
                    <NumberInput.DecrementTrigger />
                  </NumberInput.Control>
                </NumberInput.Root>
                {/* @ts-ignore */}
                <Text fontSize="sm">{t("submissionInbox.filters.daysInQueueDays")}</Text>
              </HStack>
              <Separator />
              <HStack w="full" justifyContent="space-between">
                <Button variant="plain" size="sm" onClick={handleClear}>
                  {t("ui.clear")}
                </Button>
                <Button variant="primary" size="sm" onClick={handleApply}>
                  {t("ui.apply")}
                </Button>
              </HStack>
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
})
