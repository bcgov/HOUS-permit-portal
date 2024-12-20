import { Select, SelectProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../../types/types"

interface ISandboxSelectProps extends Omit<SelectProps, "onChange"> {
  onChange: (value: string) => void
  value?: string // Make value optional
  options: IOption[]
  includeLive?: boolean
}

export const SandboxSelect = observer(function SandboxSelect({
  onChange,
  value,
  options,
  includeLive,
  ...rest
}: ISandboxSelectProps) {
  const { t } = useTranslation()

  return (
    <Select
      id="sandbox-select"
      aria-label="Select a sandbox"
      w="full"
      onChange={(e) => onChange(e.target.value)}
      value={value || ""}
      {...rest}
    >
      {includeLive && <option value={""}>{t("sandbox.live")}</option>}
      {options.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </Select>
  )
})
