import { Flex, Switch, SwitchProps } from "@chakra-ui/react"
import { Check, X } from "@phosphor-icons/react"
import React from "react"

interface ISwitchButton extends SwitchProps {
  enable: boolean
  update: (checked: boolean) => void
  size: string
}

export const SwitchButton = ({ enable, update, size, ...rest }: ISwitchButton) => {
  return (
    <Switch
      id="inbox-enabled-switch"
      isChecked={enable}
      onChange={(e) => update(e.target.checked)}
      size={size}
      colorScheme="blue"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      position="relative"
      {...rest}
    >
      <Flex position="absolute" top="34%" left={enable ? "54%" : "15%"} fontSize="20px">
        {enable ? <Check size={10} color={"black"} /> : <X size={10} color={"black"} />}
      </Flex>
    </Switch>
  )
}
