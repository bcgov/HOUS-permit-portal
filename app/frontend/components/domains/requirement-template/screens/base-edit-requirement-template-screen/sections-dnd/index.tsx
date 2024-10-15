import { Box, Button, ButtonGroup, Flex, Text, VStack } from "@chakra-ui/react"
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import * as R from "ramda"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  IRequirementTemplateSectionAttributes,
  ITemplateSectionBlockAttributes,
} from "../../../../../../types/api-request"
import { DroppableSection } from "./droppable-section"
import { RequirementBlock } from "./requirement-block"
import { Section } from "./section"
import { SortableRequirementBlock } from "./sortable-requirement-block"

// using https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx as base example

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

interface IProps {
  sections: IRequirementTemplateSectionAttributes[]
  onDone?: (
    dndSectionMap: {
      [key: string]: IRequirementTemplateSectionAttributes
    },
    sortedSectionsId: string[]
  ) => void
  onCancel?: () => void
}

function formSectionsMapFromSections(sections: IRequirementTemplateSectionAttributes[]) {
  return sections.reduce<{ [key: string]: IRequirementTemplateSectionAttributes }>((acc, section) => {
    acc[section.id] = section
    return acc
  }, {})
}

export function SectionsDnd({ sections, onDone, onCancel }: IProps) {
  const { t } = useTranslation()
  const [dndSectionMap, setDndSectionMap] = useState(() => formSectionsMapFromSections(sections))
  const [sortedSectionIds, setSortedSectionIds] = useState(Object.keys(dndSectionMap))
  const [clonedDndSectionMap, setClonedDndSectionMap] = useState<{
    [key: string]: IRequirementTemplateSectionAttributes
  } | null>(null)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

  useEffect(() => {
    const newDndSectionMap = formSectionsMapFromSections(sections)
    setDndSectionMap(newDndSectionMap)
    setSortedSectionIds(Object.keys(newDndSectionMap))
  }, [sections])

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable sections intersecting with the pointer.
   * - If there are none, find intersecting sections with the active draggable.
   * - If there are no intersecting sections, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && isSection(activeId as string)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) => isSection(container.id as string)),
        })
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, "id")

      if (overId != null) {
        if (isSection(overId as string)) {
          const sectionBlocks = getSectionById(overId).templateSectionBlocksAttributes

          // If a section is matched and it contains blocks
          if (sectionBlocks.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  sectionBlocks.findIndex((sectionBlock) => sectionBlock.id === container.id) > -1
              ),
            })[0]?.id
          }
        }

        lastOverId.current = overId

        return [{ id: overId }]
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, dndSectionMap]
  )

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
    // TODO: nice to have this in the future. The copied over code from DnD Kit example
    // does not seem to work on up direction for keyboard
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: multipleContainersKeyboardCoordinateGetter,
    // })
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [dndSectionMap])

  return (
    <Box
      id="sections-sidebar-reordering"
      as={"section"}
      w={"sidebar.width"}
      h="calc(100vh) "
      bg="greys.white"
      borderRight={"1px solid"}
      borderColor={"border.light"}
      boxShadow={"elevations.elevation01"}
      position="sticky"
      top="0"
      zIndex="1"
      float="left"
    >
      <Box
        width="var(--app-sidebar-remaining-width)"
        height="full"
        bg="greys.grey03"
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        left={"var(--app-sidebar-width)"}

        // hide the form side so user can focus on drag /up down and can't click the form accordions (in sections-display)
      >
        <Text fontStyle="italic" textAlign="center" color="text.secondary" my="30%">
          {t("requirementTemplate.edit.dndInstructions")}
        </Text>
      </Box>
      <Flex w={"full"} justifyContent={"flex-end"} bg={"theme.blue"} py={5} px={4}>
        <ButtonGroup size={"sm"}>
          <Button variant={"primaryInverse"} onClick={() => onDone(dndSectionMap, sortedSectionIds)}>
            {t("ui.done")}
          </Button>
          <Button variant={"secondaryInverse"} onClick={onCancel}>
            {t("ui.cancel")}
          </Button>
        </ButtonGroup>
      </Flex>
      <Text as={"h3"} fontSize={"md"} color={"text.secondary"} fontWeight={700} py={1} px={4} bg={"greys.grey03"}>
        {t("requirementTemplate.edit.dndTitle")}
      </Text>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
      >
        <VStack
          w={"full"}
          h="calc( 100vh - 76px)"
          overflow={"auto"}
          alignItems={"flex-start"}
          align-self={"stretch"}
          px={3}
          pt={2}
          pb={80}
          borderRight={"1px solid"}
          borderColor={"border.light"}
          boxSizing={"border-box"}
        >
          <SortableContext items={sortedSectionIds} strategy={verticalListSortingStrategy}>
            {sortedSectionIds.map((id) => {
              const section = getSectionById(id)
              const sectionBlocks = section?.templateSectionBlocksAttributes
              const isSortingSection = activeId in dndSectionMap
              return (
                <DroppableSection
                  key={section.id}
                  sectionName={section.name}
                  id={section.id}
                  childRequirementBlockIds={R.pluck("id", sectionBlocks)}
                >
                  <SortableContext items={R.pluck("id", sectionBlocks ?? [])} strategy={verticalListSortingStrategy}>
                    <VStack ml={7} borderLeft={"1px solid"} borderColor={"border.light"}>
                      {sectionBlocks.map((block, index) => {
                        return (
                          <SortableRequirementBlock
                            disabled={isSortingSection}
                            key={block.id}
                            id={block.id}
                            requirementBlockId={block.requirementBlockId}
                          />
                        )
                      })}
                    </VStack>
                  </SortableContext>
                </DroppableSection>
              )
            })}
          </SortableContext>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId
              ? isSection(activeId)
                ? renderSectionDragOverlay(activeId)
                : renderSortableRequirementBlockDragOverlay(activeId)
              : null}
          </DragOverlay>
        </VStack>
      </DndContext>
    </Box>
  )

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id)
    setClonedDndSectionMap(R.clone(dndSectionMap))
  }

  function onDragCancel() {
    if (clonedDndSectionMap) {
      // Reset sections to their original state in case sectionBlocks have been
      // Dragged across sections
      setDndSectionMap(R.clone(clonedDndSectionMap))
    }

    setActiveId(null)
    setClonedDndSectionMap(null)
  }

  // onDragOver move dragged block from original section to new section
  function onDragOver({ active, over }: DragOverEvent) {
    const overId = over?.id

    // return if active item is a section
    if (overId == null || isSection(active.id)) {
      return
    }

    const overSection = getSectionOrParentSection(overId)
    const activeSection = getSectionOrParentSection(active.id)

    // return if any section is undefined or if the active block is being dragged within same section
    if (!overSection || !activeSection || activeSection?.id === overSection?.id) {
      return
    }

    setDndSectionMap((pastDndSectionMap) => {
      const activeSectionBlocks = pastDndSectionMap[activeSection.id].templateSectionBlocksAttributes
      const overSectionBlocks = pastDndSectionMap[overSection.id].templateSectionBlocksAttributes
      const overSectionBlockIndex = overSectionBlocks.findIndex((block) => block.id === overId)
      const activeSectionBlockIndex = activeSectionBlocks.findIndex((block) => block.id === active.id)

      let newIndex: number

      if (overId in pastDndSectionMap) {
        // if active block is over a new section but not any specific block within new section
        // place block at end of new section
        newIndex = overSectionBlocks.length + 1
      } else {
        // handle case where active block is over a new section and a specific block of that section

        // Computes is the active block should be placed at the position of the over block
        // or placed below the over block
        const isBelowOverSectionBlock =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverSectionBlock ? 1 : 0

        newIndex = overSectionBlockIndex >= 0 ? overSectionBlockIndex + modifier : overSectionBlocks.length + 1
      }

      recentlyMovedToNewContainer.current = true

      const clonedPastSectionMap = R.clone(pastDndSectionMap)
      const clonedActiveSectionBlocks = clonedPastSectionMap[activeSection.id].templateSectionBlocksAttributes
      const clonedOverSectionBlocks = clonedPastSectionMap[overSection.id].templateSectionBlocksAttributes

      // Removes active block from original section to new position in new section
      return R.mergeRight(clonedPastSectionMap, {
        [activeSection.id]: {
          ...clonedPastSectionMap[activeSection.id],
          templateSectionBlocksAttributes: clonedActiveSectionBlocks.filter((block) => block.id !== active.id),
        },
        [overSection.id]: {
          ...clonedPastSectionMap[overSection.id],
          templateSectionBlocksAttributes: [
            ...clonedOverSectionBlocks.slice(0, newIndex),
            {
              ...clonedActiveSectionBlocks[activeSectionBlockIndex],
              requirementTemplateSectionId: overSection.id,
            },
            ...clonedOverSectionBlocks.slice(newIndex, clonedOverSectionBlocks.length),
          ],
        },
      })
    })
  }

  function isSection(id: UniqueIdentifier) {
    return id in dndSectionMap
  }

  function getSectionById(id: UniqueIdentifier): IRequirementTemplateSectionAttributes | undefined {
    return dndSectionMap[id]
  }

  function getSectionBlockById(id: UniqueIdentifier): ITemplateSectionBlockAttributes | undefined {
    const sectionWithBlock = Object.values(dndSectionMap).find(
      (section) => section.templateSectionBlocksAttributes.findIndex((blockAttribute) => blockAttribute.id === id) > -1
    )
    return sectionWithBlock?.templateSectionBlocksAttributes?.find((blockAttribute) => blockAttribute.id === id)
  }

  function getSectionOrParentSection(id: UniqueIdentifier) {
    if (isSection(id)) {
      return getSectionById(id)
    }
    const sectionWithBlock = Object.values(dndSectionMap).find(
      (section) => section.templateSectionBlocksAttributes.findIndex((blockAttribute) => blockAttribute.id === id) > -1
    )

    return sectionWithBlock
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    // if active item is a section then only need to resort the section ids
    if (isSection(active.id) && over?.id) {
      setSortedSectionIds((pastSectionIds) => {
        const activeIndex = pastSectionIds.indexOf(active.id as string)
        const overIndex = pastSectionIds.indexOf(over.id as string)

        return arrayMove(pastSectionIds, activeIndex, overIndex)
      })
    }

    const activeSection = getSectionOrParentSection(active.id)

    if (!activeSection) {
      setActiveId(null)
      return
    }

    const overId = over?.id

    if (!overId) {
      setActiveId(null)
      return
    }

    const overSection = getSectionOrParentSection(overId)

    if (overSection) {
      const activeBlockIndex = activeSection.templateSectionBlocksAttributes.findIndex(
        (block) => block.id === active.id
      )
      const overBlockIndex = overSection.templateSectionBlocksAttributes.findIndex((block) => block.id === overId)

      if (activeBlockIndex !== overBlockIndex) {
        // moves active block to new position within the same section. We only consider
        // the same section because if a block is moved to a new section, that movement
        // is already handled by the `onDragOver` handler as that places the active block
        // to the new section.
        setDndSectionMap((pastSectionsMap) => {
          const clonedPastSectionsMap = R.clone(pastSectionsMap)
          return {
            ...clonedPastSectionsMap,
            [overSection.id]: {
              ...clonedPastSectionsMap[overSection.id],
              templateSectionBlocksAttributes: arrayMove(
                pastSectionsMap[overSection.id].templateSectionBlocksAttributes,
                activeBlockIndex,
                overBlockIndex
              ),
            },
          }
        })
      }
    }

    setActiveId(null)
  }

  function renderSortableRequirementBlockDragOverlay(id: UniqueIdentifier) {
    const sectionBlock = getSectionBlockById(id)
    return (
      <RequirementBlock
        requirementBlockId={sectionBlock.requirementBlockId}
        containerProps={{ boxShadow: "md", pr: 2 }}
      />
    )
  }

  function renderSectionDragOverlay(sectionId: UniqueIdentifier) {
    const section = getSectionById(sectionId)
    const sectionBlocks = section?.templateSectionBlocksAttributes
    return (
      <Section sectionName={section?.name} containerProps={{ boxShadow: "md", pr: 2, borderRadius: "sm" }}>
        <VStack w="full" ml={7} borderLeft={"1px solid"} borderColor={"border.light"} alignItems={"flex-start"}>
          {sectionBlocks.map((block, index) => {
            return <RequirementBlock key={block.id} requirementBlockId={block.requirementBlockId} />
          })}
        </VStack>
      </Section>
    )
  }
}
