import { Select } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../../types/types"

interface ISandboxSelectProps {
  onChange: (value: string) => void
  value?: string // Make value optional
  options: IOption[]
}

export const SandboxSelect = observer(function SandboxSelect({ onChange, value, options }: ISandboxSelectProps) {
  const { t } = useTranslation()

  return (
    <Select
      id="sandbox-select"
      aria-label="Select a sandbox"
      w={56}
      onChange={(e) => onChange(e.target.value)}
      value={value || ""}
    >
      <option value={""}>{t("sandbox.live")}</option>
      {options.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </Select>
  )
})
