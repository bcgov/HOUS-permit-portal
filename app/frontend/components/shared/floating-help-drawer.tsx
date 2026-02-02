import { Box, ButtonProps, Portal, Stack } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import React from "react"
import { HelpDrawer } from "./help-drawer"

interface IProps extends Partial<ButtonProps> {}

export function FloatingHelpDrawer({ ...buttonProps }: IProps) {
  return (
    <Portal>
      <Box right="0" position="fixed" width="fit-content" mr="6" mb="6" ml="auto">
        <Stack spacing="4" align="right" width="fit-content">
          {" "}
          <HelpDrawer
            defaultButtonProps={{
              size: "sm",
              variant: "primary",
              p: undefined,
              leftIcon: <Info />,
              top: "36",
              ...buttonProps,
            }}
          />
        </Stack>
      </Box>
    </Portal>
  )
}
