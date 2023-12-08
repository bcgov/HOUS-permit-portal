import React from "react"

import { faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Action, ActionProps } from "./action"

export function Remove(props: Partial<ActionProps>) {
  return (
    <Action
      icon={<FontAwesomeIcon icon={faX} />}
      aria-label={"Remove Tree Item"}
      {...props}
      active={{
        fill: "rgba(255, 70, 70, 0.95)",
        background: "rgba(255, 70, 70, 0.1)",
      }}
    />
  )
}
