import { DividerProps, Separator } from "@chakra-ui/react"
import React from "react"

interface IYellowLineSmallProps extends DividerProps {}

export const YellowLineSmall = ({ ...rest }: IYellowLineSmallProps) => {
  return <Separator borderWidth={2} w={9} opacity={1} borderColor="theme.yellow" {...rest} />
}
