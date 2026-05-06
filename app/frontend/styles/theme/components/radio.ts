import { defineSlotRecipe } from "@chakra-ui/react"

export const Radio = defineSlotRecipe({
  slots: ["item", "itemControl", "itemText", "root"],
  variants: {
    variant: {
      binary: {
        item: {
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
      },
    },
  },
})
