import { UniqueIdentifier } from "@dnd-kit/core"
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"
import { ISectionProps, Section } from "./section"

const animateLayoutChanges: AnimateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

interface IDroppableSectionProps extends ISectionProps {
  disabled?: boolean
  id: UniqueIdentifier
  childRequirementBlockIds: string[]
}

export function DroppableSection({
  id,
  childRequirementBlockIds = [],
  disabled,
  containerProps,
  ...sectionProps
}: IDroppableSectionProps) {
  const { attributes, isDragging, listeners, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: "section",
      children: childRequirementBlockIds,
    },
    animateLayoutChanges,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...containerProps?.style,
  }
  // const isOverContainer = over
  //   ? (id === over.id && active?.data.current?.type !== "container") || items.includes(over.id)
  //   : false

  return (
    <Section
      ref={setNodeRef}
      containerProps={{ opacity: isDragging ? 0.5 : undefined, w: "full", ...containerProps, style }}
      dragHandleProps={{ ...attributes, ...listeners }}
      {...sectionProps}
    />
  )
}
