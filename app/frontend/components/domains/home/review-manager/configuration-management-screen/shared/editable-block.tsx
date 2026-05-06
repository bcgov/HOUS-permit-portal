import { Flex, Text, chakra } from "@chakra-ui/react"

export const EditableBlockContainer = chakra(Flex)
EditableBlockContainer.defaultProps = {
  bg: "greys.grey03",
  alignItems: "center",
  justifyContent: "space-between",
  p: 6,
  rounded: "sm",
  w: "full",
  gap: 6,
  minH: "136px",
}

export const EditableBlockHeading = chakra(Text)
EditableBlockHeading.defaultProps = {
  fontSize: "lg",
  color: "text.primary",
  fontWeight: "bold",
}
