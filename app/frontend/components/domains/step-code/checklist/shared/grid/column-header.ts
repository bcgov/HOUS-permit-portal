import { GridItem, styled } from "@chakra-ui/react"

export const GridColumnHeader = styled(GridItem)
GridColumnHeader.defaultProps = {
  bg: "greys.grey03",
  py: 2.5,
  px: 4,
  display: "flex",
  alignItems: "center",
  textAlign: "center",
  color: "text.primary",
  fontWeight: "bold",
  fontSize: "sm",
  borderColor: "borders.light",
  borderTopWidth: 1,
  borderLeftWidth: 1,
}
