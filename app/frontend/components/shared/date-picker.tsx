import { Box, BoxProps, Button, Text } from "@chakra-ui/react"
import { CalendarBlank, CaretDown } from "@phosphor-icons/react"
import React, { forwardRef } from "react"
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker"
import { useTranslation } from "react-i18next"
import { datefnsAppDateFormat } from "../../constants"

interface IProps extends ReactDatePickerProps {
  containerProps?: Partial<BoxProps>
}

const CustomInput = forwardRef<
  HTMLButtonElement,
  {
    placeHolderText?: string
    value?: string | null
    onClick?: () => void
  }
>(({ value, onClick, ...rest }, ref) => {
  const { t } = useTranslation()
  return (
    <Button
      w={"full"}
      lineHeight="27px"
      borderRadius="sm"
      px={3}
      py={"0.375rem"}
      _disabled={{
        bg: "greys.grey10",
      }}
      border={"1px solid"}
      borderColor="border.light"
      bg={"white"}
      _hover={{ borderColor: "border.base" }}
      sx={{
        "&:focus": { borderColor: "focus" },
      }}
      leftIcon={<CalendarBlank color={"var(--chakra-colors-text-secondary)"} size={20} />}
      rightIcon={<CaretDown color={"var(--chakra-colors-text-secondary)"} size={20} />}
      color={value ? "text.primary" : "greys.grey01"}
      aria-label={"Select date"}
      onClick={onClick}
      ref={ref}
      {...rest}
    >
      <Text as={"span"} textAlign={"start"} flex={1}>
        {value || t("ui.select")}
      </Text>
    </Button>
  )
})

export function DatePicker({ containerProps, ...datePickerProps }: IProps) {
  return (
    <Box
      w={"200px"}
      sx={{
        ".react-datepicker__input-container": {
          w: "200px",
        },
      }}
      {...containerProps}
    >
      <ReactDatePicker
        customInput={<CustomInput />}
        dateFormat={datefnsAppDateFormat}
        popperPlacement={"bottom-start"}
        showPopperArrow={false}
        {...datePickerProps}
      />
    </Box>
  )
}
