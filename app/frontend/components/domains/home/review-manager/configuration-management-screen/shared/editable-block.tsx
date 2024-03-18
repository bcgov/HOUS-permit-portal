import { Flex, Text, styled } from "@chakra-ui/react"

export const EditableBlockContainer = styled(Flex)
EditableBlockContainer.defaultProps = {
  bg: "greys.grey03",
  alignItems: "center",
  justifyContent: "space-between",
  p: 6,
  rounded: "sm",
  w: "full",
  gap: 6,
}

export const EditableBlockHeading = styled(Text)
EditableBlockHeading.defaultProps = {
  fontSize: "lg",
  color: "text.primary",
  fontWeight: "bold",
}
