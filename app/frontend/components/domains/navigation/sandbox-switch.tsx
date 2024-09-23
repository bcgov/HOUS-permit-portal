import { FormControl, FormLabel, Switch } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"

export const SandboxSwitch = observer(function SandboxSwitch() {
  const { sandboxStore } = useMst()
  const { setCurrentSandbox, active, activate, deactivate } = sandboxStore
  const { t } = useTranslation()

  const handleToggle = () => {
    if (active) {
      deactivate()
    } else {
      activate()
    }
  }

  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="sandbox-switch" mb="0">
        {t("sandbox.sandboxMode")}
      </FormLabel>
      <Switch id="sandbox-switch" isChecked={sandboxStore.active} onChange={handleToggle} />
    </FormControl>
  )
})
