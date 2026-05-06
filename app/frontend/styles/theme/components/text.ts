import { defineRecipe } from "@chakra-ui/react"

export const Text = defineRecipe({
  base: {
    mb: 0,
  },

  variants: {
    variant: {
      tiny_uppercase: {
        fontSize: "xxs",
        fontWeight: "bold",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      },
    },
  },
})
