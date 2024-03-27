import { Box, BoxProps, Stack } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import React from "react"
import { HelpDrawer } from "./help-drawer"

interface IProps extends Partial<BoxProps> {}

export function FloatingHelpDrawer({ ...boxProps }: IProps) {
  return (
    <Box top="30" right="0" position="sticky" width="fit-content" mt="6" mr="6" mb="-6" ml="auto" {...boxProps}>
      <Stack spacing="4" align="right" width="fit-content">
        <HelpDrawer
          defaultButtonProps={{
            size: "sm",
            variant: "primary",
            p: undefined,
            leftIcon: <Info />,
          }}
        />
      </Stack>
    </Box>
  )
}
