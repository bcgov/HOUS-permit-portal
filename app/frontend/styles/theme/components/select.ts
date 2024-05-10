import { selectAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(selectAnatomy.keys)

const baseStyle = definePartsStyle({
  // define the part you're going to style
  field: {
    _disabled: {
      bg: "greys.grey04",
      color: "greys.grey01",
      borderColor: "border.light",
      opacity: 1,
    },
  },
  icon: {
    _disabled: {
      color: "text.primary",
    },
  },
})

export const Select = defineMultiStyleConfig({ baseStyle })
