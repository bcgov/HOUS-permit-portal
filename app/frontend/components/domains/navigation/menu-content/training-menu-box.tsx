import { Box, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../setup/root"
import { colors } from "../../../../styles/theme/foundations/colors"
import { MyProjectsMenuItem } from "./menu-items/my-projects-menu-item"
import { SandboxMenuItem } from "./menu-items/sandbox-menu-item"

const sandboxStripeBg = `repeating-linear-gradient(
  45deg,
  ${colors.background.sandboxStripe} 5px,
  ${colors.background.sandboxStripe} 10px,
  rgba(0, 0, 0, 0) 10px,
  rgba(0, 0, 0, 0) 20px
)`

export const TrainingMenuBox = observer(() => {
  const { sandboxStore } = useMst()
  const { isSandboxActive } = sandboxStore

  return (
    <VStack
      align="stretch"
      spacing={0}
      w="full"
      mt="-2 !important"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.light"
      borderRadius="md"
    >
      {isSandboxActive && <Box h={2} w="full" bg="background.sandboxBase" bgImage={sandboxStripeBg} />}
      <VStack align="stretch" spacing={0} w="full" p={1}>
        <SandboxMenuItem />
        {isSandboxActive && <MyProjectsMenuItem />}
      </VStack>
    </VStack>
  )
})
