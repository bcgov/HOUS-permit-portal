import { useDraggable, UseDraggableArguments } from "@dnd-kit/core"
import React, { CSSProperties } from "react"

interface IProps {
  draggableArguments: UseDraggableArguments
  Component: (prop: { dragMotionStyles: CSSProperties; draggableProps: ReturnType<typeof useDraggable> }) => JSX.Element
}

export function Draggable({ draggableArguments, Component }: IProps) {
  const draggableProps = useDraggable(draggableArguments)

  const style = draggableProps?.transform
    ? {
        transform: `translate3d(${draggableProps?.transform.x}px, ${draggableProps?.transform.y}px, 0)`,
      }
    : undefined

  return <Component dragMotionStyles={style} draggableProps={draggableProps} />
}
