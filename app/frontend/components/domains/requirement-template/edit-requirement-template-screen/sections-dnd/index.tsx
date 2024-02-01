import { Box, VStack } from "@chakra-ui/react"
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import * as R from "ramda"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { IRequirementTemplateSectionsAttribute } from "../../../../../types/api-request"
import { IRequirementTemplateForm } from "../index"
import { DroppableSection } from "./droppable-section"
import { Section } from "./section"

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

type Items = { id: Record<UniqueIdentifier, UniqueIdentifier[]> }

interface IProps {}

export function SectionsDnd({}: IProps) {
  const { control, watch } = useFormContext<IRequirementTemplateForm>()
  const { fields: sectionFields } = useFieldArray({ control, name: "requirementTemplateSectionsAttributes" })
  const watchedSectionFields = watch("requirementTemplateSectionsAttributes")
  const sortedSectionIds = useMemo(() => R.pluck("id", watchedSectionFields), [watchedSectionFields])

  const isSection = (id: string) => watchedSectionFields.some((section) => section.id === id)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

  const getSectionById = (id: UniqueIdentifier): IRequirementTemplateSectionsAttribute | undefined =>
    watchedSectionFields.find((section) => section.id === id)

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  // const collisionDetectionStrategy: CollisionDetection = useCallback(
  //   (args) => {
  //     if (activeId && isSection(activeId as string)) {
  //       return closestCenter({
  //         ...args,
  //         droppableContainers: args.droppableContainers.filter((container) => isSection(container.id as string)),
  //       })
  //     }
  //
  //     // Start by finding any intersecting droppable
  //     const pointerIntersections = pointerWithin(args)
  //     const intersections =
  //       pointerIntersections.length > 0
  //         ? // If there are droppables intersecting with the pointer, return those
  //           pointerIntersections
  //         : rectIntersection(args)
  //     let overId = getFirstCollision(intersections, "id")
  //
  //     if (overId != null) {
  //       if (isSection(overId as string)) {
  //         const containerItems = items[overId]
  //
  //         // If a container is matched and it contains items (columns 'A', 'B', 'C')
  //         if (containerItems.length > 0) {
  //           // Return the closest droppable within that container
  //           overId = closestCenter({
  //             ...args,
  //             droppableContainers: args.droppableContainers.filter(
  //               (container) => container.id !== overId && containerItems.includes(container.id)
  //             ),
  //           })[0]?.id
  //         }
  //       }
  //
  //       lastOverId.current = overId
  //
  //       return [{ id: overId }]
  //     }
  //
  //     // When a draggable item moves to a new container, the layout may shift
  //     // and the `overId` may become `null`. We manually set the cached `lastOverId`
  //     // to the id of the draggable item that was moved to the new container, otherwise
  //     // the previous `overId` will be returned which can cause items to incorrectly shift positions
  //     if (recentlyMovedToNewContainer.current) {
  //       lastOverId.current = activeId
  //     }
  //
  //     // If no droppable is matched, return the last match
  //     return lastOverId.current ? [{ id: lastOverId.current }] : []
  //   },
  //   [activeId, items]
  // )
  const [clonedItems, setClonedItems] = useState<Items | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: multipleContainersCoordinateGetter,
    // })
  )
  // const findContainer = (id: UniqueIdentifier) => {
  //   if (id in items) {
  //     return id
  //   }
  //
  //   return Object.keys(items).find((key) => items[key].includes(id))
  // }
  //
  // const getIndex = (id: UniqueIdentifier) => {
  //   const container = findContainer(id)
  //
  //   if (!container) {
  //     return -1
  //   }
  //
  //   const index = items[container].indexOf(id)
  //
  //   return index
  // }
  //
  const onDragCancel = () => {
    // if (clonedItems) {
    //   // Reset items to their original state in case items have been
    //   // Dragged across containers
    //   setItems(clonedItems)
    // }
    //
    // setActiveId(null)
    // setClonedItems(null)
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [watchedSectionFields])

  return (
    <DndContext
      sensors={sensors}
      // collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id)
        // setClonedItems(items)
      }}
      onDragOver={({ active, over }) => {
        // const overId = over?.id
        //
        // if (overId == null || overId === TRASH_ID || active.id in items) {
        //   return
        // }
        //
        // const overContainer = findContainer(overId)
        // const activeContainer = findContainer(active.id)
        //
        // if (!overContainer || !activeContainer) {
        //   return
        // }
        //
        // if (activeContainer !== overContainer) {
        //   setItems((items) => {
        //     const activeItems = items[activeContainer]
        //     const overItems = items[overContainer]
        //     const overIndex = overItems.indexOf(overId)
        //     const activeIndex = activeItems.indexOf(active.id)
        //
        //     let newIndex: number
        //
        //     if (overId in items) {
        //       newIndex = overItems.length + 1
        //     } else {
        //       const isBelowOverItem =
        //         over &&
        //         active.rect.current.translated &&
        //         active.rect.current.translated.top > over.rect.top + over.rect.height
        //
        //       const modifier = isBelowOverItem ? 1 : 0
        //
        //       newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
        //     }
        //
        //     recentlyMovedToNewContainer.current = true
        //
        //     return {
        //       ...items,
        //       [activeContainer]: items[activeContainer].filter((item) => item !== active.id),
        //       [overContainer]: [
        //         ...items[overContainer].slice(0, newIndex),
        //         items[activeContainer][activeIndex],
        //         ...items[overContainer].slice(newIndex, items[overContainer].length),
        //       ],
        //     }
        //   })
        // }
      }}
      onDragEnd={({ active, over }) => {
        setActiveId(null)
        //
        // if (active.id in items && over?.id) {
        //   setContainers((containers) => {
        //     const activeIndex = containers.indexOf(active.id)
        //     const overIndex = containers.indexOf(over.id)
        //
        //     return arrayMove(containers, activeIndex, overIndex)
        //   })
        // }
        //
        // const activeContainer = findContainer(active.id)
        //
        // if (!activeContainer) {
        //   setActiveId(null)
        //   return
        // }
        //
        // const overId = over?.id
        //
        // if (overId == null) {
        //   setActiveId(null)
        //   return
        // }
        //
        // if (overId === PLACEHOLDER_ID) {
        //   const newContainerId = getNextContainerId()
        //
        //   unstable_batchedUpdates(() => {
        //     setContainers((containers) => [...containers, newContainerId])
        //     setItems((items) => ({
        //       ...items,
        //       [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
        //       [newContainerId]: [active.id],
        //     }))
        //     setActiveId(null)
        //   })
        //   return
        // }
        //
        // const overContainer = findContainer(overId)
        //
        // if (overContainer) {
        //   const activeIndex = items[activeContainer].indexOf(active.id)
        //   const overIndex = items[overContainer].indexOf(overId)
        //
        //   if (activeIndex !== overIndex) {
        //     setItems((items) => ({
        //       ...items,
        //       [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
        //     }))
        //   }
        // }
        //
        // setActiveId(null)
      }}
      // onDragCancel={onDragCancel}
    >
      <VStack
        w={"368px"}
        alignItems={"flex-start"}
        align-self={"stretch"}
        px={3}
        py={2}
        borderRight={"1px solid"}
        borderColor={"border.light"}
        h={"100%"}
        boxSizing={"border-box"}
      >
        <SortableContext items={sortedSectionIds} strategy={verticalListSortingStrategy}>
          {watchedSectionFields.map((field, index) => {
            return <DroppableSection key={field.id} sectionName={field.name} id={field.id} />
          })}
        </SortableContext>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId
            ? isSection(activeId as string)
              ? renderSectionDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>
      </VStack>
    </DndContext>
  )

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return <Box bg={"blue"}>{id}</Box>
  }

  function renderSectionDragOverlay(sectionId: UniqueIdentifier) {
    const section = getSectionById(sectionId)
    return <Section sectionName={section?.name} containerProps={{ boxShadow: "md", pr: 2, w: "fit-content" }} />
  }
}
