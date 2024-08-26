import { HStack, IconButton, Stack, Text } from "@chakra-ui/react"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { List as ListIcon } from "@phosphor-icons/react/dist/csr/List"
import * as R from "ramda"
import React, { CSSProperties, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { SortableItem } from "../../../shared/sortable-item"
import { IRequirementBlockForm } from "./index"

export function ReorderList() {
  const { reset, setValue, watch, control } = useFormContext<IRequirementBlockForm>()
  const { t } = useTranslation()
  const watchedRequirements = watch("requirementsAttributes")
  const requirementIds = useMemo(() => watchedRequirements.map((f) => f.id), [watchedRequirements])
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <Stack spacing={2} px={3}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={requirementIds} strategy={verticalListSortingStrategy}>
          {requirementIds.map((id, index) => {
            const watchedLabel = watch(`requirementsAttributes.${index}.label`)
            const sortableLabel = watchedLabel || t("requirementsLibrary.modals.unlabeled")
            return (
              <SortableItem<{ label: string }>
                key={id}
                sortableArguments={{ id }}
                Component={Component}
                componentProps={{ label: sortableLabel }}
              />
            )
          })}
        </SortableContext>
      </DndContext>
    </Stack>
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = watchedRequirements.findIndex((r) => r.id === active.id)
      const newIndex = watchedRequirements.findIndex((r) => r.id === over.id)

      // have to use setValue, and array move instead of move from useFieldArray. This is because the move
      // causes some weird behaviour where the sub fields are not updated correctly
      setValue("requirementsAttributes", arrayMove(R.clone(watchedRequirements), oldIndex, newIndex))
    }
  }
}

function Component({
  sortableProps,
  dragMotionStyles,
  label,
}: {
  dragMotionStyles: CSSProperties
  sortableProps: ReturnType<typeof useSortable>
  label: string
}) {
  return (
    <HStack
      ref={sortableProps?.setNodeRef}
      style={dragMotionStyles}
      {...sortableProps?.listeners}
      {...sortableProps?.attributes}
    >
      <IconButton aria-label={"drag-handle"} variant={"ghost"} icon={<ListIcon />} />
      <Text>{label}</Text>
    </HStack>
  )
}
