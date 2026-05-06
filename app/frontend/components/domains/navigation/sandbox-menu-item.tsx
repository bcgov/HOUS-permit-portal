import { Switch } from "@/components/ui/switch"
import { Flex, Menu, Separator, Text, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { ETemplateVersionStatus } from "../../../types/enums"
import { SandboxSwitchModal } from "../../shared/modals/sandbox-switch-modal"

export const SandboxMenuItem: React.FC = observer(() => {
  const { t } = useTranslation()
  const { sandboxStore, userStore } = useMst()
  const { currentUser } = userStore
  const { sandboxOptions } = currentUser.jurisdiction
  const { currentSandboxId, setCurrentSandboxId, clearSandboxId, isSandboxActive } = sandboxStore

  const { open, onOpen, onClose } = useDisclosure()

  // Find published sandbox and default to it
  const publishedSandbox = currentUser.jurisdiction?.sandboxes.find(
    (s) => s.templateVersionStatusScope === ETemplateVersionStatus.published
  )
  const [selectedOption, setSelectedOption] = useState(publishedSandbox?.id || sandboxOptions[0]?.value)

  const navigate = useNavigate()

  // Handler for toggling the switch
  const handleToggle = () => {
    onOpen() // Open modal in both cases
  }

  // Handler for confirming turning on the switch
  const handleConfirm = () => {
    if (isSandboxActive) {
      clearSandboxId() // Turn off sandbox mode
    } else {
      setCurrentSandboxId(selectedOption) // Turn on sandbox mode
    }
    onClose()
    navigate(0)
  }

  if (!currentUser.jurisdiction || R.isEmpty(sandboxOptions)) return <></>

  return (
    <>
      <Menu.Item value="sandbox-switch" onClick={handleToggle} py={3}>
        <Flex justify="space-between" w="full">
          <Text>{t("sandbox.switch.label")}</Text>
          <Switch checked={isSandboxActive} pointerEvents="none" />
        </Flex>
      </Menu.Item>
      <Separator my={0} borderColor="border.light" />
      <SandboxSwitchModal
        open={open}
        onClose={onClose}
        isSandboxActive={isSandboxActive}
        sandboxOptions={sandboxOptions}
        selectedOption={selectedOption}
        onSelectedOptionChange={setSelectedOption}
        onConfirm={handleConfirm}
      />
    </>
  )
})
