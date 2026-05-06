import { defineSlotRecipe } from "@chakra-ui/react"

export const FormLabel = defineSlotRecipe({
  slots: ["root", "label", "helperText", "errorText"],
  base: {
    label: {
      color: "text.primary",
      fontWeight: "semibold",
      lineHeight: "27px",
      marginBottom: 1,
      _disabled: {
        opacity: 1,
      },
    },
  },
})
