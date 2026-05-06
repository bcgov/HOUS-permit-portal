import { defineSlotRecipe } from "@chakra-ui/react"

export const Tag = defineSlotRecipe({
  slots: ["root", "label", "startElement", "endElement", "closeTrigger"],
  base: {
    root: {
      borderRadius: "sm",
      fontWeight: 600,
    },
  },
  variants: {
    variant: {
      success: {
        root: {
          background: "semantic.successLight",
          color: "semantic.success",
          border: "1px solid",
          borderColor: "semantic.success",
        },
      },
      error: {
        root: {
          background: "semantic.errorLight",
          color: "semantic.error",
          border: "1px solid",
          borderColor: "semantic.error",
        },
      },
    },
  },
})
