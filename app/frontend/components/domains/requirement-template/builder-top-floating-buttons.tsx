import { Stack, StackProps } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import React from "react"
import { HelpDrawer } from "../../shared/help-drawer"

interface IProps extends Partial<StackProps> {}

export function BuilderTopFloatingButtons({ ...containerProps }: IProps) {
  return (
    <Stack zIndex={2} spacing={4} position={"sticky"} top={6} mt={6} mr={6} alignItems={"flex-end"} {...containerProps}>
      <HelpDrawer
        defaultButtonProps={{
          size: "sm",
          variant: "primary",
          p: undefined,
          leftIcon: <Info size={"0.875rem"} />,
          fontSize: "sm",
        }}
      />
    </Stack>
  )
}
