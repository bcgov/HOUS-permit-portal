import { defineSlotRecipe } from "@chakra-ui/react"

export const Tabs = defineSlotRecipe({
  slots: ["root", "list", "trigger", "content", "indicator"],
  variants: {
    variant: {
      sidebar: {
        trigger: {
          justifyContent: "flex-start",
          _selected: {
            fontWeight: "bold",
            bg: "background.blueLight",
            _hover: {
              bg: "hover.blue",
            },
          },
          _hover: {
            bg: "greys.grey02",
          },
        },
      },
    },
  },
})
