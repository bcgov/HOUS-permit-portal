import { tableAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys)

const styles = {
  baseStyle: {
    table: {},
    thead: {},
    tbody: {},
    tr: {
      borderTop: "1px solid",
      borderColor: "border.light",
    },
    th: {
      color: "text.secondary",
      fontWeight: "normal",
    },
    td: {},
    tfoot: {},
    caption: {},
  },
  sizes: {
    md: {
      td: { py: 5, px: 4 },
      th: { p: 4 },
    },
  },
}

export const Table = defineMultiStyleConfig(styles)
