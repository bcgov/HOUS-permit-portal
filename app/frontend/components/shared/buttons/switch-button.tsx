import { Switch } from "@/components/ui/switch"
import { Check, X } from "@phosphor-icons/react"
import React, { ChangeEvent } from "react"

interface ISwitchButton extends SwitchProps {
  isChecked?: boolean
  checked?: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  size: string
}

export const SwitchButton = ({ isChecked, checked, onChange, size, ...rest }: ISwitchButton) => {
  const switchChecked = checked ?? isChecked ?? false

  return (
    <Switch checked={switchChecked} onValueChange={onChange} size={size} position="relative" {...rest}>
      <Flex position="absolute" top="34%" left={switchChecked ? "54%" : "15%"} fontSize="20px">
        {switchChecked ? <Check size={10} color={"black"} /> : <X size={10} color={"black"} />}
      </Flex>
    </Switch>
  )
}
