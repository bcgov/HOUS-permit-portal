import classNames from "classnames"
import React, { CSSProperties, forwardRef } from "react"

import { IconButton, IconButtonProps } from "@chakra-ui/react"
import styles from "./action.module.css"

export interface ActionProps extends Partial<IconButtonProps> {
  active?: {
    fill: string
    background: string
  }
  cursor?: CSSProperties["cursor"]
  icon: JSX.Element
  "aria-label": string
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ active, className, cursor, style, ...props }, ref) => {
    return (
      <IconButton
        variant={"ghost"}
        tabIndex={0}
        ref={ref}
        className={classNames(styles.Action, className)}
        style={
          {
            ...style,
            cursor,
            "--fill": active?.fill,
            "--background": active?.background,
          } as CSSProperties
        }
        {...props}
      />
    )
  }
)
