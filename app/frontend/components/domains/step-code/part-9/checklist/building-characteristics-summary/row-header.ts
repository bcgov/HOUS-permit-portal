import { styled } from "@chakra-ui/react"
import { GridRowHeader } from "../shared/grid/row-header"

export const RowHeader = styled(GridRowHeader)
RowHeader.defaultProps = { fontWeight: "bold", justifyContent: "start" }
