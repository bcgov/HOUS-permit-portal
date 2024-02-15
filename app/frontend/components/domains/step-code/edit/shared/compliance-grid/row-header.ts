import { GridItem, styled } from "@chakra-ui/react"

export const GridRowHeader = styled(GridItem)
GridRowHeader.defaultProps = {
  py: 2,
  px: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  justifyContent: "center",
  borderTopWidth: 1,
  borderColor: "borders.light",
}
