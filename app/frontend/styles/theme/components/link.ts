import { defineRecipe } from "@chakra-ui/react"

export const Link = defineRecipe({
  base: {
    color: "text.link",
    textDecoration: "underline",
    textDecorationThickness: "1px",

    "& svg": {
      display: "inline",
      marginLeft: "1",
      marginRight: "1",
    },

    _hover: {
      color: "text.primary",
      textDecorationThickness: "3px",
    },
  },
})
