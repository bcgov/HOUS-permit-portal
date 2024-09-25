import { Select } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"

interface ISandboxSelectProps {
  onChange: (value: string) => void
  value: string
  options: IOption[]
}

export const SandboxSelect = observer(function SandboxSelect({ onChange, value, options }: ISandboxSelectProps) {
  const { sandboxStore } = useMst()
  // const { sandboxOptions, currentSandboxId, setCurrentSandboxId } = sandboxStore
  const { t } = useTranslation()

  return (
    <Select aria-label={"Select a sandbox"} w={56} onChange={(e) => onChange(e.target.value)} value={value}>
      {options.map((s) => (
        <option value={s.value}>{s.label}</option>
      ))}
    </Select>
  )
})
