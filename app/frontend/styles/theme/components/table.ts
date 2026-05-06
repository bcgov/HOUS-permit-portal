import { defineSlotRecipe } from "@chakra-ui/react"

export const Table = defineSlotRecipe({
  slots: ["root", "header", "body", "row", "columnHeader", "cell", "footer", "caption"],
  base: {
    root: {},
    header: {},
    body: {},
    row: {
      borderTop: "1px solid",
      borderColor: "border.light",
    },
    columnHeader: {
      color: "text.secondary",
      fontWeight: "normal",
    },
    cell: {},
    footer: {},
    caption: {},
  },
  variants: {
    size: {
      md: {
        cell: { py: 5, px: 4 },
        columnHeader: { p: 4 },
      },
    },
  },
})
