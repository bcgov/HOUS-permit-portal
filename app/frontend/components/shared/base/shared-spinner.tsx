import { Spinner, SpinnerProps } from "@chakra-ui/react"
import React from "react"

interface ISharedSpinner extends SpinnerProps {}

export const SharedSpinner = ({ ...rest }: ISharedSpinner) => {
  return <Spinner color="theme.blue" {...rest} />
}
