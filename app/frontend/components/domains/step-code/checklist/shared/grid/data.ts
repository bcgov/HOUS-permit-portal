import { styled } from "@chakra-ui/react"
import { GridRowHeader } from "./row-header"

export const GridData = styled(GridRowHeader)
GridData.defaultProps = {
  alignItems: "center",
  py: 2.5,
  px: 4,
  borderColor: "borders.light",
  borderTopWidth: 1,
  borderLeftWidth: 1,
}
