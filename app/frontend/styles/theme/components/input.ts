import { inputAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys)

const baseStyle = definePartsStyle({
  field: {
    lineHeight: "27px",
    borderRadius: "sm",
    paddingInlineStart: 3,
    paddingInlineEnd: 3,
    _disabled: {
      bg: "greys.grey04",
      borderColor: "border.light",
      color: "greys.grey01",
      opacity: 1,
      _hover: {
        borderColor: "border.light",
        cursor: "auto",
      },
    },
    _placeholder: { color: "greys.grey01" },
  },
})

const styles = {
  baseStyle,
  variants: {
    outline: {
      field: {
        borderColor: "border.light",
        _hover: { borderColor: "greys.grey01" },
      },
    },
  },
}

export const Input = defineMultiStyleConfig(styles)
