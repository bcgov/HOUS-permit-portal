import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { addDays, format, parseISO, startOfDay } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { datefnsAppDateFormat } from "../../../../../constants"
import { DatePicker } from "../../../../shared/date-picker"

export interface IMeetingDateRangeValue {
  from: string | null
  to: string | null
}

interface IProps {
  value: IMeetingDateRangeValue
  onChange: (value: IMeetingDateRangeValue) => void
  onApply: () => void
  onClear: () => void
}

const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd")

const parseOptionalIsoDate = (value: string | null | undefined): Date | null => {
  if (!value) return null
  try {
    const date = parseISO(value)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export const MeetingDateFilter = observer(function MeetingDateFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [localFrom, setLocalFrom] = useState<Date | null>(() => parseOptionalIsoDate(value.from))
  const [localTo, setLocalTo] = useState<Date | null>(() => parseOptionalIsoDate(value.to))

  useEffect(() => {
    setLocalFrom(parseOptionalIsoDate(value.from))
    setLocalTo(parseOptionalIsoDate(value.to))
  }, [value.from, value.to])

  const hasSelection = !!(value.from || value.to)

  const applyRange = (from: Date | null, to: Date | null) => {
    onChange({
      from: from ? toIsoDate(from) : null,
      to: to ? toIsoDate(to) : null,
    })
    onApply()
    onClose()
  }

  const handleApply = () => applyRange(localFrom, localTo)

  const handleClear = () => {
    setLocalFrom(null)
    setLocalTo(null)
    onClear()
    onClose()
  }

  const handleNextDays = (days: number) => {
    const from = startOfDay(new Date())
    const to = startOfDay(addDays(from, days - 1))
    setLocalFrom(from)
    setLocalTo(to)
    applyRange(from, to)
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
          <Text>{t("submissionInbox.filters.meetingDate")}</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent w="auto" minW="280px" p={4} zIndex="dropdown">
        <PopoverBody p={0}>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" fontWeight="medium">
              {t("submissionInbox.filters.meetingDatesBetween")}
            </Text>
            <FormControl>
              <FormLabel fontSize="sm" mb={1}>
                {t("submissionInbox.filters.meetingDateFrom")}
              </FormLabel>
              <DatePicker
                selected={localFrom}
                onChange={(date: Date | null) => setLocalFrom(date)}
                selectsStart
                startDate={localFrom}
                endDate={localTo}
                dateFormat={datefnsAppDateFormat}
                isClearable
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" mb={1}>
                {t("submissionInbox.filters.meetingDateTo")}
              </FormLabel>
              <DatePicker
                selected={localTo}
                onChange={(date: Date | null) => setLocalTo(date)}
                selectsEnd
                startDate={localFrom}
                endDate={localTo}
                minDate={localFrom ?? undefined}
                dateFormat={datefnsAppDateFormat}
                isClearable
              />
            </FormControl>
            <hr />
            <HStack spacing={2}>
              <Button variant="secondary" size="sm" onClick={() => handleNextDays(7)}>
                {t("submissionInbox.filters.next7Days")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleNextDays(30)}>
                {t("submissionInbox.filters.next30Days")}
              </Button>
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
