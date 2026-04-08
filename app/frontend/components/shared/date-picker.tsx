import { Box, BoxProps, Button, Text } from "@chakra-ui/react"
import type { SystemStyleObject } from "@chakra-ui/styled-system"
import { CalendarBlank, CaretDown } from "@phosphor-icons/react"
import * as R from "ramda"
import React, { forwardRef } from "react"
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useTranslation } from "react-i18next"
import { datefnsAppDateFormat } from "../../constants"

type IDatePickerPropsBase = {
  containerProps?: Partial<BoxProps>
}

export type IDatePickerProps =
  | (ReactDatePickerProps & IDatePickerPropsBase) // single-date
  | (ReactDatePickerProps<boolean> & IDatePickerPropsBase) // range

const CustomInput = forwardRef<
  HTMLButtonElement,
  {
    value?: string | null
    readOnly?: boolean
    onClick?: () => void
  }
>(({ value, onClick, readOnly, ...rest }, ref) => {
  const { t } = useTranslation()

  return (
    <Button
      w={"full"}
      lineHeight="27px"
      borderRadius="sm"
      px={3}
      py={"0.375rem"}
      _disabled={{
        bg: "greys.grey04",
        color: "text.secondary",
        opacity: 1,
        _hover: {
          borderColor: "greys.grey01",
          cursor: "not-allowed",
        },
        _focus: {
          borderColor: "focus",
        },
      }}
      border={"1px solid"}
      borderColor="border.input"
      bg={"white"}
      _hover={{ borderColor: "border.input" }}
      sx={{
        "&:focus": { borderColor: "focus" },
      }}
      leftIcon={<CalendarBlank color={"var(--chakra-colors-text-secondary)"} size={20} />}
      rightIcon={<CaretDown color={"var(--chakra-colors-text-secondary)"} size={20} />}
      color={value ? "text.primary" : "greys.grey01"}
      aria-label={"Select date"}
      role={"date-picker"}
      onClick={onClick}
      ref={ref}
      isDisabled={readOnly}
      {...rest}
    >
      <Text as={"span"} textAlign={"start"} flex={1}>
        {value || (!readOnly && t("ui.select"))}
      </Text>
    </Button>
  )
})

export function DatePicker({ containerProps, ...datePickerProps }: IDatePickerProps) {
  const sxStyles = containerProps?.sx || {}
  return (
    <Box
      w={"200px"}
      {...containerProps}
      sx={
        R.mergeDeepRight(
          {
            ".react-datepicker__input-container": {
              w: "200px",
            },
            ".react-datepicker__close-icon": {
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              right: "32px",
              left: "auto",
              width: "24px",
              height: "24px",
              padding: 0,
              "::after": {
                color: "var(--chakra-colors-text-secondary)",
                background: "none",
                content: `"\\2715"`,
                fontSize: "var(--chakra-fontSizes-sm)",
              },
            },
          },
          sxStyles
        ) as SystemStyleObject
      }
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
