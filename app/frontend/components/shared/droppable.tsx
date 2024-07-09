import { useDroppable, UseDroppableArguments } from "@dnd-kit/core"
import React from "react"

interface IProps {
  droppableArguments: UseDroppableArguments
  Component: (prop: { droppableProps: ReturnType<typeof useDroppable> }) => JSX.Element
}

export function Droppable({ droppableArguments, Component }: IProps) {
  const droppableProps = useDroppable(droppableArguments)

  return <Component droppableProps={droppableProps} />
}
