import React, { forwardRef } from "react"

import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Action, ActionProps } from "./action"

export const Handle = forwardRef<HTMLButtonElement, ActionProps>((props, ref) => {
  return (
    <Action
      ref={ref}
      cursor="grab"
      icon={<FontAwesomeIcon icon={faBars} />}
      aria-label={"Tree Item Drag Handle"}
      {...props}
    />
  )
})
