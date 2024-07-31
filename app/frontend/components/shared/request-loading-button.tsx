import { Button, ButtonProps } from "@chakra-ui/react"
import React, { MouseEventHandler, forwardRef, useState } from "react"

interface IProps extends Omit<ButtonProps, "onClick"> {
  onClick: (e?: React.MouseEvent) => Promise<any>
}

export const RequestLoadingButton = forwardRef<HTMLButtonElement, IProps>(function RequestLoadingButton(
  { onClick, ...rest },
  ref
) {
  const [isLoading, setIsLoading] = useState(false)

  const onClickHandler: MouseEventHandler<HTMLButtonElement> = async (e) => {
    try {
      setIsLoading(true)
      await onClick(e)
    } finally {
      setIsLoading(false)
    }
  }

  return <Button {...rest} ref={ref} onClick={onClickHandler} isLoading={isLoading} />
})
