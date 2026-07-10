import {
  Box,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  SimpleGridProps,
  Text,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from "@chakra-ui/react"
import { CaretDown, Clock } from "@phosphor-icons/react"
import { eachMinuteOfInterval, format, parse } from "date-fns"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"

const TIME_VALUE_FORMAT = "HH:mm"
const TIME_LABEL_FORMAT = "h:mm a"

export type TimeSlotValue = string // "HH:mm"

export type ITimeSlotPickerProps = {
  value?: TimeSlotValue
  onChange?: (value: TimeSlotValue) => void
  name?: string
  /** Inclusive start time, "HH:mm". Default "06:00". */
  startTime?: TimeSlotValue
  /** Inclusive end time, "HH:mm". Default "21:00". */
  endTime?: TimeSlotValue
  /** Minutes between slots. Default 15. */
  intervalMinutes?: number
  /** Values to disable (still shown). */
  disabledTimes?: TimeSlotValue[]
  isDisabled?: boolean
  placeholder?: string
  columns?: SimpleGridProps["columns"]
  spacing?: SimpleGridProps["spacing"]
}

export function generateTimeSlots(
  startTime: TimeSlotValue = "06:00",
  endTime: TimeSlotValue = "21:00",
  intervalMinutes = 15
): TimeSlotValue[] {
  const referenceDate = new Date(2000, 0, 1)
  const start = parse(startTime, TIME_VALUE_FORMAT, referenceDate)
  const end = parse(endTime, TIME_VALUE_FORMAT, referenceDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end || intervalMinutes <= 0) {
    return []
  }

  return eachMinuteOfInterval({ start, end }, { step: intervalMinutes }).map((date) => format(date, TIME_VALUE_FORMAT))
}

function formatTimeLabel(value: TimeSlotValue) {
  return format(parse(value, TIME_VALUE_FORMAT, new Date(2000, 0, 1)), TIME_LABEL_FORMAT)
}

function TimeSlotTile({
  label,
  isDisabled,
  onCommit,
  ...radioProps
}: UseRadioProps & { label: string; isDisabled?: boolean; onCommit?: () => void }) {
  const { getInputProps, getRadioProps } = useRadio({ ...radioProps, isDisabled })
  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box
      as="label"
      w="full"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      onClick={(e) => {
        if (isDisabled) return
        // Arrow-key radio navigation synthesizes a click with detail 0; ignore those.
        // Real pointer clicks have detail >= 1. Enter/Space confirm via grid keydown.
        if (e.detail === 0) return
        onCommit?.()
      }}
    >
      <input {...input} />
      <Box
        {...checkbox}
        w="full"
        textAlign="center"
        px={3}
        py={2}
        bg="white"
        borderWidth="1px"
        borderColor="border.base"
        borderRadius="md"
        color="text.primary"
        fontSize="sm"
        lineHeight="1.25"
        opacity={isDisabled ? 0.5 : 1}
        _checked={{
          borderColor: "theme.blue",
          color: "theme.blue",
          fontWeight: "medium",
          bg: "white",
        }}
        _hover={
          isDisabled
            ? undefined
            : {
                borderColor: "theme.blue",
                color: "theme.blue",
              }
        }
        _focusVisible={{
          boxShadow: "0 0 0 3px rgba(46,93,215,0.4)",
        }}
      >
        {label}
      </Box>
    </Box>
  )
}

function TimeSlotGrid({
  value,
  onChange,
  onCommit,
  name = "time-slot",
  startTime = "06:00",
  endTime = "21:00",
  intervalMinutes = 15,
  disabledTimes,
  isDisabled,
  columns = { base: 2, sm: 3 },
  spacing = 2,
}: Omit<ITimeSlotPickerProps, "placeholder"> & { onCommit?: () => void }) {
  const slots = useMemo(
    () => generateTimeSlots(startTime, endTime, intervalMinutes),
    [startTime, endTime, intervalMinutes]
  )
  const disabledSet = useMemo(() => new Set(disabledTimes ?? []), [disabledTimes])

  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value: value || undefined,
    onChange,
    isDisabled,
  })

  return (
    <SimpleGrid
      columns={columns}
      spacing={spacing}
      {...getRootProps()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onCommit?.()
        }
      }}
    >
      {slots.map((slot) => {
        const radio = getRadioProps({ value: slot })
        return (
          <TimeSlotTile
            key={slot}
            {...radio}
            label={formatTimeLabel(slot)}
            isDisabled={isDisabled || disabledSet.has(slot)}
            onCommit={onCommit}
          />
        )
      })}
    </SimpleGrid>
  )
}

export function TimeSlotPicker({ value, onChange, isDisabled, placeholder, ...gridProps }: ITimeSlotPickerProps) {
  const { t } = useTranslation()
  const displayValue = value ? formatTimeLabel(value) : ""

  return (
    <Popover placement="bottom-start" isLazy>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              w="full"
              lineHeight="27px"
              borderRadius="sm"
              px={3}
              py="0.375rem"
              border="1px solid"
              borderColor="border.input"
              bg="white"
              leftIcon={<Clock color="var(--chakra-colors-text-secondary)" size={20} />}
              rightIcon={<CaretDown color="var(--chakra-colors-text-secondary)" size={20} />}
              color={displayValue ? "text.primary" : "greys.grey01"}
              fontWeight="normal"
              isDisabled={isDisabled}
              _hover={{ borderColor: "border.input" }}
              _disabled={{
                bg: "greys.grey04",
                color: "text.secondary",
                opacity: 1,
                _hover: {
                  borderColor: "greys.grey01",
                  cursor: "not-allowed",
                },
              }}
              sx={{ "&:focus": { borderColor: "focus" } }}
              aria-label={placeholder || t("ui.select")}
            >
              <Text as="span" textAlign="start" flex={1}>
                {displayValue || placeholder || t("ui.select")}
              </Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent w="xs" p={3} borderColor="border.light" boxShadow="lg" maxH="xs" overflowY="auto">
            <TimeSlotGrid value={value} isDisabled={isDisabled} {...gridProps} onChange={onChange} onCommit={onClose} />
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
