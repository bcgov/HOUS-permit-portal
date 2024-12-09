import { radioAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(radioAnatomy.keys)

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

export const Radio = defineMultiStyleConfig({ variants: { binary } })
