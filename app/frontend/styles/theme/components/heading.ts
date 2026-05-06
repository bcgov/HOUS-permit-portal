import { defineRecipe } from "@chakra-ui/react"

export const Heading = defineRecipe({
  base: {
    lineHeight: "150%",
    marginBottom: "0.5em",

    _before: {
      content: `""`,
    },
  },

  variants: {
    variant: {
      yellowline: {
        // puts a decorative yellow bar above the header text
        marginTop: "1em",
        lineHeight: "150%",
        _before: {
          display: "block",
          width: "36px",
          height: "8px",
          borderTop: "4px solid",
          borderColor: "theme.yellow",
        },
      },
      heading3: {
        as: "h3",
        fontSize: "lg",
      },
      heading4: {
        as: "h4",
        fontSize: "lg",
      },
    },
  },
})
