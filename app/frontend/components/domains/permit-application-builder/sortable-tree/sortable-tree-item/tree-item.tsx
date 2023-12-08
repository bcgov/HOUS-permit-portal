import classNames from "classnames"
import React, { forwardRef, HTMLAttributes } from "react"

import { Box, Text } from "@chakra-ui/react"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Action } from "./action"
import { Handle } from "./handle"
import { Remove } from "./remove"
import styles from "./tree-item.module.css"

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
  childCount?: number
  clone?: boolean
  collapsed?: boolean
  depth: number
  disableInteraction?: boolean
  disableSelection?: boolean
  ghost?: boolean
  handleProps?: any
  indicator?: boolean
  indentationWidth: number
  value: string

  onCollapse?(): void

  onRemove?(): void

  wrapperRef?(node: HTMLLIElement): void
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        as={"li"}
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <Box className={styles.TreeItem} ref={ref} style={style}>
          <Handle {...handleProps} />
          {onCollapse && (
            <Action
              icon={<FontAwesomeIcon icon={faChevronDown} aria-label={"Tree Item Collapse"} />}
              onClick={onCollapse}
              className={classNames(styles.Collapse, collapsed && styles.collapsed)}
              aria-label={"Tree Item Collapse"}
            />
          )}
          <Text as={"span"} className={styles.Text}>
            {value}
          </Text>

          {!clone && onRemove && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <Text
              as={"span"}
              aria-description={"The number of sub tree items under this tree item"}
              className={styles.Count}
            >
              {childCount}
            </Text>
          ) : null}
        </Box>
      </Box>
    )
  }
)
