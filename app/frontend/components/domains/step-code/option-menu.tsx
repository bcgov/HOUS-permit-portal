import { Button, Menu, MenuButton, MenuItem, MenuList, Portal } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import React from "react"

interface IProps<T extends string> {
  value?: T | null
  options: readonly T[]
  label: (value: T) => string
  onChange: (value: T) => void
  placeholder?: string
  isInvalid?: boolean
  isDisabled?: boolean
}

export function OptionMenu<T extends string>({
  value,
  options,
  label,
  onChange,
  placeholder,
  isInvalid,
  isDisabled,
}: IProps<T>) {
  const isEmpty = value === undefined || value === null
  const borderColor = isInvalid ? "semantic.error" : "border.light"

  return (
    <Menu matchWidth>
      <MenuButton
        as={Button}
        variant="unstyled"
        isDisabled={isDisabled}
        w="full"
        h={10}
        px={3}
        display="flex"
        alignItems="center"
        bg="white"
        fontWeight="normal"
        textAlign="left"
        justifyContent="space-between"
        borderWidth="1px"
        borderStyle="solid"
        borderRadius="sm"
        borderColor={borderColor}
        color={isEmpty ? "greys.grey01" : "text.primary"}
        rightIcon={<CaretDown color="var(--chakra-colors-greys-grey01)" />}
        _hover={{ bg: "white", borderColor: isInvalid ? "semantic.error" : "greys.grey01" }}
        _active={{ bg: "white", borderColor }}
        _disabled={{
          bg: "greys.grey04",
          borderColor: "border.light",
          color: "text.primary",
          opacity: 1,
          cursor: "not-allowed",
          _hover: { bg: "greys.grey04", borderColor: "border.light" },
        }}
      >
        {isEmpty ? placeholder : label(value)}
      </MenuButton>
      <Portal>
        <MenuList zIndex={1600} maxH="15rem" overflowY="auto">
          {options.map((option) => (
            <MenuItem key={option} onClick={() => onChange(option)}>
              {label(option)}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
  )
}
