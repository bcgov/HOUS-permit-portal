import { styled } from "@chakra-ui/react"
import { GridRowHeader } from "./row-header"

export const GridData = styled(GridRowHeader)
GridData.defaultProps = {
  borderRightWidth: 1,
  alignItems: "center",
}
