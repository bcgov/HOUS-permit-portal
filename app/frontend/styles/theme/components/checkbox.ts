import { checkboxAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(checkboxAnatomy.keys)

const baseStyle = definePartsStyle({
  control: {
    bg: "greys.white",
    _disabled: {
      bg: "greys.grey03",
    },
  },
})

export const Checkbox = defineMultiStyleConfig({ baseStyle })
