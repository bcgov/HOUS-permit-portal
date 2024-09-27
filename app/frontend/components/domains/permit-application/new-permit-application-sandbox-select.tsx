import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { SandboxSelect } from "../../shared/select/selectors/sandbox-select"

interface INewPermitApplicationSandboxSelectProps {
  options: IOption[]
}

export const NewPermitApplicationSandboxSelect = observer(function NavSandboxSelect({
  options,
}: INewPermitApplicationSandboxSelectProps) {
  const { sandboxStore } = useMst()
  const { currentSandboxId, setCurrentSandboxId, clearSandboxId } = sandboxStore
  const { t } = useTranslation()

  useEffect(() => {
    //When the component unmounts, clear the currentSandboxId
    return () => clearSandboxId()
  }, [])

  return <SandboxSelect onChange={setCurrentSandboxId} value={currentSandboxId} options={options} />
})
