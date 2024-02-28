import { GridItem, styled } from "@chakra-ui/react"

export const GridColumnHeader = styled(GridItem)
GridColumnHeader.defaultProps = {
  bg: "greys.grey03",
  py: 4,
  px: 2,
  display: "flex",
  alignItems: "center",
  textAlign: "center",
  color: "text.primary",
  fontWeight: "bold",
  borderRightWidth: 1,
  borderColor: "borders.light",
}
