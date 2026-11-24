import { FormControl, FormLabel } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { SandboxSelect } from "../../shared/select/selectors/sandbox-select"

export const NavSandboxSelect = observer(function NavSandboxSelect() {
  const { sandboxStore, userStore } = useMst()
  const { currentUser } = userStore
  const { currentSandboxId, setCurrentSandboxId } = sandboxStore
  const { t } = useTranslation()

  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="sandbox-select" mb="0" color="white">
        {t("sandbox.formLabel")}
      </FormLabel>
      <SandboxSelect
        onChange={setCurrentSandboxId}
        value={currentSandboxId}
        options={currentUser.jurisdiction.sandboxOptions}
      />
    </FormControl>
  )
})
