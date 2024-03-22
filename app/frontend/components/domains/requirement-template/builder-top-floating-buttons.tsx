import { Box, Stack, StackProps } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import React from "react"
import { HelpDrawer } from "../../shared/help-drawer"

interface IProps extends Partial<StackProps> {}

export function BuilderTopFloatingButtons({ ...containerProps }: IProps) {
  return (
    <Box zIndex="10" position="absolute" top="90px" right="6" {...containerProps}>
      <Stack spacing="4" align="right" width="fit-content">
        <HelpDrawer
          defaultButtonProps={{
            size: "sm",
            variant: "primary",
            p: undefined,
            leftIcon: <Info size={"0.875rem"} />,
          }}
        />
      </Stack>
    </Box>
  )
}
