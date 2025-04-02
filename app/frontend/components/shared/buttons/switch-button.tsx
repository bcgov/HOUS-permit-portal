import { Flex, Switch, SwitchProps } from "@chakra-ui/react"
import { Check, X } from "@phosphor-icons/react"
import React, { ChangeEvent } from "react"

interface ISwitchButton extends SwitchProps {
  isChecked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  size: string
}

export const SwitchButton = ({ isChecked, onChange, size, ...rest }: ISwitchButton) => {
  return (
    <Switch isChecked={isChecked} onChange={onChange} size={size} position="relative" {...rest}>
      <Flex position="absolute" top="34%" left={isChecked ? "54%" : "15%"} fontSize="20px">
        {isChecked ? <Check size={10} color={"black"} /> : <X size={10} color={"black"} />}
      </Flex>
    </Switch>
  )
}
