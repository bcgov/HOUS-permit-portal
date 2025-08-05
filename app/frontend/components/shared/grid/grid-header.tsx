import { GridItem, styled } from "@chakra-ui/react"

export const GridHeader = styled(GridItem)
GridHeader.defaultProps = {
  fontSize: "sm",
  py: 5,
  color: "text.secondary",
  fontWeight: 400,
  borderBottom: "1px solid",
  borderColor: "border.light",
  role: "columnheader",
}
