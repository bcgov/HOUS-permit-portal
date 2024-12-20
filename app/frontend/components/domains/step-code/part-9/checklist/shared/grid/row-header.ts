import { GridItem, styled } from "@chakra-ui/react"

export const GridRowHeader = styled(GridItem)
GridRowHeader.defaultProps = {
  py: 2.5,
  px: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  justifyContent: "center",
  borderColor: "borders.light",
  borderTopWidth: 1,
  borderLeftWidth: 1,
}
