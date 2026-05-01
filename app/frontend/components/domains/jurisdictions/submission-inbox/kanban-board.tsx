import { Badge, Box, Button, Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CaretLeft, CaretRight, Empty } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"
import { observer } from "mobx-react-lite"
import React, { ReactNode, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

export interface IKanbanColumn {
  key: string
  label: string
}

export interface IKanbanItem {
  id: string
  columnKey: string
  sortOrder?: number | null
  isUnread?: boolean
}

export interface IReorderEvent {
  itemId: string
  columnKey: string
  oldIndex: number
  newIndex: number
  orderedIds: string[]
}

export enum EReorderDirection {
  top = "top",
  up = "up",
  down = "down",
  bottom = "bottom",
}

export interface IKanbanCardContext {
  isFirst: boolean
  isLast: boolean
  onMove?: (direction: EReorderDirection) => void
}

interface IProps<T extends IKanbanItem> {
  columns: IKanbanColumn[]
  items: T[]
  stateCounts: Record<string, number>
  columnTotals?: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnKey: string) => void
  renderCard: (item: T, context: IKanbanCardContext) => ReactNode
  onShowMore?: (columnKey: string) => void
  onReorder?: (event: IReorderEvent) => void
}

function KanbanBoardInner<T extends IKanbanItem>({
  columns,
  items,
  stateCounts,
  columnTotals,
  collapsedColumns,
  onToggleColumn,
  renderCard,
  onShowMore,
  onReorder,
}: IProps<T>) {
  const { t } = useTranslation()
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

  const buildMoveHandler = useCallback(
    (columnItems: T[], index: number) => {
      if (!onReorder) return undefined
      return (direction: EReorderDirection) => {
        if (columnItems.length <= 1) return
        const lastIndex = columnItems.length - 1
        let newIndex = index
        switch (direction) {
          case EReorderDirection.top:
            newIndex = 0
            break
          case EReorderDirection.up:
            newIndex = Math.max(0, index - 1)
            break
          case EReorderDirection.down:
            newIndex = Math.min(lastIndex, index + 1)
            break
          case EReorderDirection.bottom:
            newIndex = lastIndex
            break
        }
        if (newIndex === index) return
        const reordered = [...columnItems]
        const [moved] = reordered.splice(index, 1)
        reordered.splice(newIndex, 0, moved)
        onReorder({
          itemId: columnItems[index].id,
          columnKey: columnItems[index].columnKey,
          oldIndex: index,
          newIndex,
          orderedIds: reordered.map((i) => i.id),
        })
      }
    },
    [onReorder]
  )

  return (
    <Flex direction="column" w="full" h="full" minH={0} minW={0}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <Flex w="full" h="full" minH={0} minW={0} overflowY="hidden" gap={4} pb={4} align="stretch">
          {columns.map((column) => {
            const columnItems = groupedItems[column.key] || []
            const isEmpty = columnItems.length === 0
            const isManuallyCollapsed = !isEmpty && collapsedColumns.includes(column.key)
            const isCollapsed = isEmpty || isManuallyCollapsed
            const displayedCount = columnItems.length
            const totalCount = stateCounts[column.key] ?? displayedCount
            const filteredTotal = columnTotals?.[column.key] ?? totalCount
            const hasMore = displayedCount < filteredTotal
            const unreadCount = columnItems.filter((item) => item.isUnread).length

            return (
              <Flex
                key={column.key}
                direction="column"
                minW={isCollapsed ? "64px" : "318px"}
                maxW={isCollapsed ? "64px" : "480px"}
                flex={isCollapsed ? "0 0 64px" : "1 0 318px"}
                border="1px solid"
                borderColor="border.light"
                borderRadius="lg"
                minH={0}
                bg={isCollapsed ? "greys.grey03" : "greys.grey04"}
                overflow="hidden"
                transition="min-width 0.3s cubic-bezier(0.4,0,0.2,1), max-width 0.3s cubic-bezier(0.4,0,0.2,1), flex 0.3s cubic-bezier(0.4,0,0.2,1)"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isCollapsed ? (
                    <motion.div
                      key={`${column.key}-collapsed`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
                    >
                      <Tooltip label={column.label} hasArrow placement="top">
                        <Flex
                          direction="column"
                          align="center"
                          justify="flex-start"
                          flex={1}
                          minH={0}
                          h="full"
                          overflow="hidden"
                          px={1}
                          py={3}
                          gap={5}
                        >
                          <Flex minH="24px" align="center" justify="center" flexShrink={0}>
                            {isEmpty ? (
                              <Box py={1}>
                                <Empty size={14} />
                              </Box>
                            ) : (
                              <Button
                                aria-label="Show column"
                                leftIcon={<CaretRight size={12} />}
                                variant="ghost"
                                size="xs"
                                minW="48px"
                                h={6}
                                px={0.5}
                                mt={0}
                                fontSize="xs"
                                fontWeight="normal"
                                color="text.secondary"
                                iconSpacing={0.25}
                                onClick={() => onToggleColumn(column.key)}
                              >
                                {t("submissionInbox.showColumn")}
                              </Button>
                            )}
                          </Flex>
                          <Flex justify="center" flexShrink={0} w="full">
                            <Text
                              fontSize="md"
                              fontWeight="bold"
                              textTransform="capitalize"
                              color="text.secondary"
                              textAlign="center"
                              whiteSpace="nowrap"
                              sx={{ writingMode: "vertical-rl" }}
                            >
                              {column.label}
                            </Text>
                          </Flex>
                          <Flex direction="column" align="center" flexShrink={0} gap={2}>
                            <Badge
                              borderRadius="full"
                              px={2}
                              fontSize="xs"
                              bg="white"
                              color="text.secondary"
                              border="1px solid"
                              borderColor="border.light"
                              whiteSpace="nowrap"
                              alignSelf="center"
                            >
                              {displayedCount}/{totalCount}
                            </Badge>
                          </Flex>
                        </Flex>
                      </Tooltip>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${column.key}-expanded`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
                    >
                      <Box
                        bg="greys.grey03"
                        borderBottom="1px solid"
                        borderColor="border.light"
                        borderTopRadius="lg"
                        px={3}
                        py={3}
                        flexShrink={0}
                      >
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="bold" textTransform="capitalize" color="text.secondary">
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
                              {displayedCount}/{totalCount}
                            </Badge>
                            <Button
                              aria-label="Collapse column"
                              leftIcon={<CaretLeft size={12} />}
                              variant="ghost"
                              size="xs"
                              h={6}
                              px={1}
                              fontSize="xs"
                              fontWeight="normal"
                              color="text.secondary"
                              iconSpacing={0.5}
                              onClick={() => onToggleColumn(column.key)}
                            >
                              {t("submissionInbox.hideColumn")}
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                      <Flex
                        direction="column"
                        flex={1}
                        minH={0}
                        overflowY="auto"
                        overflowX="hidden"
                        gap={3}
                        p={3}
                        sx={{
                          touchAction: "pan-y",
                        }}
                        onScroll={(e) => {
                          const el = e.currentTarget
                          if (el.scrollLeft !== 0) {
                            el.scrollLeft = 0
                          }
                        }}
                      >
                        <SortableContext items={columnItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                          {columnItems.map((item, index) =>
                            renderCard(item, {
                              isFirst: index === 0,
                              isLast: index === columnItems.length - 1,
                              onMove: buildMoveHandler(columnItems, index),
                            })
                          )}
                        </SortableContext>
                        {hasMore && onShowMore && (
                          <Button variant="link" size="sm" flexShrink={0} onClick={() => onShowMore(column.key)}>
                            {/* @ts-ignore */}
                            {t("submissionInbox.showMoreInColumn", { count: totalCount - displayedCount })}
                          </Button>
                        )}
                      </Flex>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Flex>
            )
          })}
        </Flex>
      </DndContext>
    </Flex>
  )
}

export const KanbanBoard = observer(KanbanBoardInner) as typeof KanbanBoardInner
