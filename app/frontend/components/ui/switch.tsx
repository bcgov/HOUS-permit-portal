import { Switch as ChakraSwitch } from "@chakra-ui/react"
import * as React from "react"

export interface SwitchProps extends ChakraSwitch.RootProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  rootRef?: React.RefObject<HTMLLabelElement | null>
  trackLabel?: { on: React.ReactNode; off: React.ReactNode }
  thumbLabel?: { on: React.ReactNode; off: React.ReactNode }
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onValueChange?: React.ChangeEventHandler<HTMLInputElement>
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const { inputProps, children, rootRef, trackLabel, thumbLabel, onChange, onValueChange, ...rest } = props

  return (
    <ChakraSwitch.Root ref={rootRef} {...rest}>
      <ChakraSwitch.HiddenInput ref={ref} onChange={onChange ?? onValueChange} {...inputProps} />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb>
          {thumbLabel && (
            <ChakraSwitch.ThumbIndicator fallback={thumbLabel?.off}>{thumbLabel?.on}</ChakraSwitch.ThumbIndicator>
          )}
        </ChakraSwitch.Thumb>
        {trackLabel && <ChakraSwitch.Indicator fallback={trackLabel.off}>{trackLabel.on}</ChakraSwitch.Indicator>}
      </ChakraSwitch.Control>
      {children != null && <ChakraSwitch.Label>{children}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  )
})
