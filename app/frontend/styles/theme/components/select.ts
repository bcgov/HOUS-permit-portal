import { defineSlotRecipe } from "@chakra-ui/react"

export const Select = defineSlotRecipe({
  slots: ["field", "indicator", "root"],
  base: {
    field: {
      _disabled: {
        bg: "greys.grey04",
        color: "greys.grey01",
        borderColor: "border.light",
        opacity: 1,
      },
    },
    indicator: {
      _disabled: {
        color: "text.primary",
      },
    },
  },
})
