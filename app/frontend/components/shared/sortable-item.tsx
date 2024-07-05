import { useSortable, UseSortableArguments } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React, { CSSProperties } from "react"

export interface ISortableItemProps<TComponentPops> {
  sortableArguments: UseSortableArguments
  Component: (
    props: {
      dragMotionStyles: CSSProperties
      sortableProps: ReturnType<typeof useSortable>
    } & TComponentPops
  ) => JSX.Element
  componentProps: TComponentPops
}

export function SortableItem<TComponentProps>({
  sortableArguments,
  Component,
  componentProps,
}: ISortableItemProps<TComponentProps>) {
  const sortableProps = useSortable(sortableArguments)

  const style = {
    transform: CSS.Transform.toString(sortableProps?.transform),
    transition: sortableProps?.transition,
  }

  return <Component dragMotionStyles={style} sortableProps={sortableProps} {...componentProps} />
}
