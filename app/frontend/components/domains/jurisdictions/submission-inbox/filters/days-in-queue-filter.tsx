import {
  Button,
  Divider,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Select,
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

const parseDays = (rawDays: string, valueAsNumber: number) => {
  if (rawDays.trim() === "") return null
  return Number.isFinite(valueAsNumber) ? valueAsNumber : null
}

export const DaysInQueueFilter = observer(function DaysInQueueFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [localOperator, setLocalOperator] = useState<string>(value?.operator ?? "gte")
  const [localDays, setLocalDays] = useState<string>(value?.days != null ? String(value.days) : "")

  useEffect(() => {
    if (isOpen) return
    setLocalOperator(value?.operator ?? "gte")
    setLocalDays(value?.days != null ? String(value.days) : "")
  }, [value?.operator, value?.days, isOpen])

  const hasSelection = value != null

  const commit = (operator: string, rawDays: string, valueAsNumber: number) => {
    const days = parseDays(rawDays, valueAsNumber)
    if (days == null || days <= 0) {
      if (value != null) onClear()
      return
    }
    if (value?.operator === operator && value.days === days) return
    onChange({ operator, days })
    onApply()
  }

  const handleClear = () => {
    setLocalOperator("gte")
    setLocalDays("")
    onClear()
    onClose()
  }

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom-start" closeOnBlur>
      <PopoverTrigger>
        <Button
          variant="secondary"
          rightIcon={<CaretDown />}
          bg={hasSelection ? "background.blueLight" : undefined}
          borderColor={hasSelection ? "theme.blueActive" : undefined}
          size="sm"
          fontWeight="normal"
        >
          {/* @ts-ignore */}
          <Text>{t("submissionInbox.filters.daysInQueue")}</Text>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="auto" minW="240px" p={4} zIndex="dropdown">
          <PopoverBody p={0}>
            <VStack align="start" spacing={3}>
              <Select
                size="sm"
                value={localOperator}
                onChange={(e) => {
                  const operator = e.target.value
                  setLocalOperator(operator)
                  commit(operator, localDays, Number(localDays))
                }}
              >
                {/* @ts-ignore */}
                <option value="gte">{t("submissionInbox.filters.daysInQueueGte")}</option>
                {/* @ts-ignore */}
                <option value="lt">{t("submissionInbox.filters.daysInQueueLt")}</option>
              </Select>
              <HStack spacing={2}>
                <NumberInput
                  size="sm"
                  min={0}
                  value={localDays}
                  onChange={(valueAsString, valueAsNumber) => {
                    setLocalDays(valueAsString)
                    commit(localOperator, valueAsString, valueAsNumber)
                  }}
                  maxW="100px"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {/* @ts-ignore */}
                <Text fontSize="sm">{t("submissionInbox.filters.daysInQueueDays")}</Text>
              </HStack>
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
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
