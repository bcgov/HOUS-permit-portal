import { radioAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(radioAnatomy.keys)

const baseStyle = definePartsStyle({
  control: {
    bg: "greys.white",
    _disabled: {
      bg: "greys.grey03",
    },
  },
})

const binary = definePartsStyle({
  container: {
    py: 3,
    px: 4,
    borderRadius: "md",
    border: "1px solid",
    borderColor: "border.light",
    _checked: {
      borderColor: "border.base",
      bg: "theme.blueLight",
    },
  },
})

export const Radio = defineMultiStyleConfig({ baseStyle, variants: { binary } })
