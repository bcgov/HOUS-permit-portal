import { Flex, Switch, Text, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../../setup/root"
import { ETemplateVersionStatus } from "../../../../../types/enums"
import { SandboxSwitchModal } from "../../../../shared/modals/sandbox-switch-modal"

export const SandboxMenuItem = observer(() => {
  const { t } = useTranslation()
  const { sandboxStore, userStore } = useMst()
  const { currentUser } = userStore
  const { sandboxOptions } = currentUser.jurisdiction
  const { setCurrentSandboxId, clearSandboxId, isSandboxActive } = sandboxStore

  const { isOpen, onOpen, onClose } = useDisclosure()

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
      <Flex
        as="button"
        onClick={handleToggle}
        align="center"
        justify="flex-start"
        gap={3}
        p={1.5}
        borderRadius="md"
        _hover={{ bg: "hover.blue", cursor: "pointer" }}
        w="full"
      >
        <Text fontWeight="medium" color="text.primary">
          {t("sandbox.switch.label")}
        </Text>
        <Switch isChecked={isSandboxActive} pointerEvents="none" />
      </Flex>

      <SandboxSwitchModal
        isOpen={isOpen}
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
