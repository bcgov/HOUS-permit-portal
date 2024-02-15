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
      borderColor: "greys.grey04",
      color: "text.primary",
      opacity: 1,
      _hover: {
        borderColor: "greys.grey04",
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
        _hover: { borderColor: "border.base" },
      },
    },
  },
}

export const Input = defineMultiStyleConfig(styles)
