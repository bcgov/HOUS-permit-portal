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

export const DaysInQueueFilter = observer(function DaysInQueueFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
      <PopoverContent w="auto" minW="240px" p={4} zIndex="dropdown">
        <PopoverBody p={0}>
          <VStack align="start" spacing={3}>
            <Select size="sm" value={localOperator} onChange={(e) => setLocalOperator(e.target.value)}>
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
                onChange={(_, val) => setLocalDays(isNaN(val) ? 0 : val)}
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
              <Button variant="primary" size="sm" onClick={handleApply}>
                {t("ui.apply")}
              </Button>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})
