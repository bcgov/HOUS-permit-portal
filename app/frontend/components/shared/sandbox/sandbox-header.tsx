import { Flex, FlexProps } from "@chakra-ui/react"
import { CubeFocus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISandbox } from "../../../models/sandbox"
import { useMst } from "../../../setup/root"
import { colors } from "../../../styles/theme/foundations/colors"

interface ISandboxHeaderProps extends FlexProps {
  expanded?: boolean
  sandbox?: ISandbox
  override?: boolean
}

const SandboxHeader: React.FC<ISandboxHeaderProps> = observer(({ expanded, sandbox, override, ...rest }) => {
  const { t } = useTranslation()
  const { sandboxStore } = useMst()
  const { isSandboxActive, currentSandbox } = sandboxStore

  const sandboxToUse = override ? sandbox : currentSandbox

  if (!isSandboxActive && !override) return null

  return (
    <Flex
      color="text.primary"
      justify="center"
      align="center"
      fontWeight="bold"
      position="absolute"
      top={0}
      left={0}
      right={0}
      height={6}
      bg="background.sandboxBase"
      bgImage={`repeating-linear-gradient(
        45deg,
        ${colors.background.sandboxStripe} 5px,
        ${colors.background.sandboxStripe} 10px,
        rgba(0, 0, 0, 0) 10px,
        rgba(0, 0, 0, 0) 20px
      )`}
      bgSize="100% 100%"
      p={1}
      borderTopRadius="lg"
      gap={2}
      textTransform="uppercase"
      fontSize="sm"
      {...rest}
    >
      <CubeFocus size={24} />
      {expanded && t("sandbox.inMode")} {sandboxToUse?.name}
    </Flex>
  )
})

export default SandboxHeader
