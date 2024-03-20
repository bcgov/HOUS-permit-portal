import { UniqueIdentifier } from "@dnd-kit/core"
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"
import { IRequirementBlockProps, RequirementBlock } from "./requirement-block"

const animateLayoutChanges: AnimateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

interface ISortableRequirementBlockProps extends IRequirementBlockProps {
  disabled?: boolean
  id: UniqueIdentifier
}

export function SortableRequirementBlock({
  id,
  disabled,
  containerProps,
  ...blockProps
}: ISortableRequirementBlockProps) {
  const { attributes, isDragging, listeners, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: "block",
    },
    animateLayoutChanges,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...containerProps?.style,
  }

  return (
    <RequirementBlock
      ref={setNodeRef}
      containerProps={{
        opacity: isDragging ? 0.5 : undefined,
        w: "full",
        ...containerProps,
        style,
      }}
      dragHandleProps={{ ...attributes, ...listeners }}
      {...blockProps}
    />
  )
}
