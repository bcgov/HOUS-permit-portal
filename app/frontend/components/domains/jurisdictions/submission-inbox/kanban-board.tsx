import { Badge, Flex, HStack, IconButton, Text } from "@chakra-ui/react"
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CaretDoubleLeft, CaretDoubleRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode, useCallback, useMemo } from "react"

export interface IKanbanColumn {
  key: string
  label: string
}

export interface IKanbanItem {
  id: string
  columnKey: string
  sortOrder?: number | null
}

export interface IReorderEvent {
  itemId: string
  columnKey: string
  oldIndex: number
  newIndex: number
  orderedIds: string[]
}

interface IProps<T extends IKanbanItem> {
  columns: IKanbanColumn[]
  items: T[]
  stateCounts: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnKey: string) => void
  renderCard: (item: T) => ReactNode
  overflowBanner?: ReactNode
  onReorder?: (event: IReorderEvent) => void
}

function KanbanBoardInner<T extends IKanbanItem>({
  columns,
  items,
  stateCounts,
  collapsedColumns,
  onToggleColumn,
  renderCard,
  overflowBanner,
  onReorder,
}: IProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const groupedItems = useMemo(() => {
    const groups: Record<string, T[]> = {}
    for (const col of columns) {
      groups[col.key] = []
    }
    for (const item of items) {
      if (groups[item.columnKey]) {
        groups[item.columnKey].push(item)
      }
    }
    for (const key of Object.keys(groups)) {
      const hasAnySortOrder = groups[key].some((i) => i.sortOrder != null)
      if (hasAnySortOrder) {
        groups[key].sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity))
      }
    }
    return groups
  }, [items, columns])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !onReorder) return

      const activeItem = items.find((i) => i.id === active.id)
      const overItem = items.find((i) => i.id === over.id)
      if (!activeItem || !overItem) return

      if (activeItem.columnKey !== overItem.columnKey) return

      const columnItems = groupedItems[activeItem.columnKey] || []
      const oldIndex = columnItems.findIndex((i) => i.id === active.id)
      const newIndex = columnItems.findIndex((i) => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const reordered = [...columnItems]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)

      onReorder({
        itemId: activeItem.id,
        columnKey: activeItem.columnKey,
        oldIndex,
        newIndex,
        orderedIds: reordered.map((i) => i.id),
      })
    },
    [items, groupedItems, onReorder]
  )

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <Flex w="full" h="full" minH={0} overflowX="auto" gap={4} pb={4} align="stretch">
          {columns.map((column) => {
            const columnItems = groupedItems[column.key] || []
            const isEmpty = columnItems.length === 0
            const isManuallyCollapsed = !isEmpty && collapsedColumns.includes(column.key)
            const isCollapsed = isEmpty || isManuallyCollapsed
            const displayedCount = columnItems.length
            const totalCount = stateCounts[column.key] ?? displayedCount

            return (
              <Flex
                key={column.key}
                direction="column"
                minW={isCollapsed ? "auto" : "260px"}
                maxW={isCollapsed ? "60px" : "320px"}
                flex={isCollapsed ? "0 0 auto" : "1 1 0"}
                bg="greys.grey03"
                borderRadius="lg"
                p={3}
                gap={3}
                minH={0}
              >
                {isCollapsed ? (
                  <>
                    {!isEmpty && (
                      <IconButton
                        aria-label="Expand column"
                        icon={<CaretDoubleRight />}
                        size="xs"
                        variant="ghost"
                        alignSelf="center"
                        onClick={() => onToggleColumn(column.key)}
                      />
                    )}
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="text.secondary"
                      sx={{ writingMode: "vertical-lr" }}
                      whiteSpace="nowrap"
                    >
                      {column.label}
                    </Text>
                    <Badge
                      borderRadius="full"
                      py={2}
                      px={1}
                      fontSize="2xs"
                      bg="white"
                      color="text.secondary"
                      border="1px solid"
                      borderColor="border.light"
                      sx={{ writingMode: "vertical-lr" }}
                      whiteSpace="nowrap"
                      alignSelf="center"
                    >
                      {displayedCount} of {totalCount}
                    </Badge>
                  </>
                ) : (
                  <>
                    <HStack justify="space-between" flexShrink={0}>
                      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="text.secondary">
                        {column.label}
                      </Text>
                      <HStack spacing={1}>
                        <Badge
                          borderRadius="full"
                          px={2}
                          fontSize="xs"
                          bg="white"
                          color="text.secondary"
                          border="1px solid"
                          borderColor="border.light"
                        >
                          {displayedCount} of {totalCount}
                        </Badge>
                        <IconButton
                          aria-label="Collapse column"
                          icon={<CaretDoubleLeft />}
                          size="xs"
                          variant="ghost"
                          onClick={() => onToggleColumn(column.key)}
                        />
                      </HStack>
                    </HStack>
                    <Flex direction="column" flex={1} minH={0} overflowY="auto" gap={3}>
                      <SortableContext items={columnItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {columnItems.map((item) => renderCard(item))}
                      </SortableContext>
                    </Flex>
                  </>
                )}
              </Flex>
            )
          })}
        </Flex>
      </DndContext>
      {overflowBanner}
    </Flex>
  )
}

export const KanbanBoard = observer(KanbanBoardInner) as typeof KanbanBoardInner
