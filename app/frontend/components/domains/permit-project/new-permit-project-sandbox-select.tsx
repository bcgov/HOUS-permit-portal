import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { SandboxSelect } from "../../shared/select/selectors/sandbox-select"

interface INewPermitProjectSandboxSelectProps {
  options: IOption[]
}

export const NewPermitProjectSandboxSelect = observer(function NewPermitProjectSandboxSelect({
  options,
}: INewPermitProjectSandboxSelectProps) {
  const { sandboxStore } = useMst()
  const { currentSandboxId, setCurrentSandboxId, temporarilyPersistSandboxId, resetTemporarilyPersistSandboxId } =
    sandboxStore

  useEffect(() => {
    temporarilyPersistSandboxId()
    return () => {
      resetTemporarilyPersistSandboxId()
    }
  }, [])

  return <SandboxSelect onChange={setCurrentSandboxId} value={currentSandboxId} options={options} includeLive />
})
