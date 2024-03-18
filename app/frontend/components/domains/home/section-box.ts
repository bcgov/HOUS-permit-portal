import { Box, styled } from "@chakra-ui/react"

export const SectionBox = styled(Box)
SectionBox.defaultProps = {
  as: "section",
  borderRadius: "lg",
  borderWidth: 1,
  borderColor: "border.light",
  p: 6,
  w: "full",
  className: "jumbo-buttons",
}
