import { GridItem, styled } from "@chakra-ui/react"

export const GridHeader = styled(GridItem, {
  baseStyle: {
    "& button": {
      fontSize: "inherit",
      fontWeight: "inherit",
      alignItems: "center",
      textAlign: "left",
    },
    "& p": {
      width: "100%",
      textAlign: "left",
    },
    "& button > svg": {
      flexShrink: 0,
    },
  },
})
GridHeader.defaultProps = {
  fontSize: "16px",
  fontWeight: "bold",
  py: 5,
  color: "text.secondary",
  borderBottom: "1px solid",
  borderColor: "border.light",
  role: "columnheader",
}
