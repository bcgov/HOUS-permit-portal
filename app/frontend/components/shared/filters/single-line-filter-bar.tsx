import {
  Box,
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CaretDown, Funnel } from "@phosphor-icons/react"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

export interface ISingleLineFilterItem {
  key: string
  isActive?: boolean
  node: React.ReactNode
}

interface IProps {
  leading?: React.ReactNode
  items: ISingleLineFilterItem[]
  trailing?: React.ReactNode
}

interface ILayout {
  signature: string
  visibleCount: number
}

export function countVisibleFilters({
  budget,
  gap,
  itemWidths,
  overflowButtonWidth,
}: {
  budget: number
  gap: number
  itemWidths: number[]
  overflowButtonWidth: number
}): number {
  if (itemWidths.length === 0 || budget <= 0) return 0

  const widthFor = (count: number) => {
    let total = 0
    for (let i = 0; i < count; i++) {
      if (i > 0) total += gap
      total += itemWidths[i]
    }
    if (count < itemWidths.length && overflowButtonWidth > 0) {
      if (count > 0) total += gap
      total += overflowButtonWidth
    }
    return total
  }

  for (let count = itemWidths.length; count >= 0; count--) {
    if (Math.ceil(widthFor(count)) <= Math.floor(budget)) return count
  }
  return 0
}

function readGap(element: HTMLElement) {
  const value = parseFloat(getComputedStyle(element).columnGap)
  return Number.isFinite(value) ? value : 0
}

export function SingleLineFilterBar({ leading, items, trailing }: IProps) {
  const { t } = useTranslation()
  const outerRef = useRef<HTMLDivElement>(null)
  const clusterRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLButtonElement>(null)
  const filtersTriggerRef = useRef<HTMLDivElement>(null)
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onClose: onFiltersClose } = useDisclosure()
  const itemElements = useRef(new Map<string, HTMLDivElement>())
  const itemRefCallbacks = useRef(new Map<string, (node: HTMLDivElement | null) => void>())
  const widthCache = useRef(new Map<string, number>())
  const itemsRef = useRef(items)
  itemsRef.current = items

  const signature = items.map((item) => item.key).join("|")
  const [layout, setLayout] = useState<ILayout | null>(null)
  const measured = layout?.signature === signature
  const visibleCount = measured ? layout.visibleCount : items.length
  const visibleItems = items.slice(0, visibleCount)
  const overflowItems = measured ? items.slice(visibleCount) : []
  const activeOverflowCount = overflowItems.filter((item) => item.isActive).length
  const filtersLabel = activeOverflowCount > 0 ? `${t("ui.filters")} (${activeOverflowCount})` : t("ui.filters")

  const itemRef = (key: string) => {
    let callback = itemRefCallbacks.current.get(key)
    if (!callback) {
      callback = (node) => {
        if (node) itemElements.current.set(key, node)
        else itemElements.current.delete(key)
      }
      itemRefCallbacks.current.set(key, callback)
    }
    return callback
  }

  const buttonShownRef = useRef(false)
  buttonShownRef.current = overflowItems.length > 0

  const recomputeRef = useRef(() => {})
  recomputeRef.current = () => {
    const cluster = clusterRef.current
    const currentItems = itemsRef.current
    if (!cluster || currentItems.length === 0) return

    const itemWidths = currentItems.map((item) => {
      const measuredWidth = itemElements.current.get(item.key)?.offsetWidth ?? 0
      // ponytail: a chip parked in the closed menu can report 0, so keep the last real width
      if (measuredWidth > 0) widthCache.current.set(item.key, measuredWidth)
      return widthCache.current.get(item.key) ?? null
    })
    if (itemWidths.some((width) => width == null)) return

    const measuredButtonWidth = measureRef.current?.offsetWidth ?? 0
    const buttonShown = buttonShownRef.current
    const buttonWidth = (buttonShown ? filtersTriggerRef.current?.offsetWidth : 0) || measuredButtonWidth
    if (buttonWidth <= 0) return

    // The cluster is the space between the view switches and Clear all. Chips pack
    // to its right edge, beside the Filters button, so leftover space stays on the left.
    const clusterGap = readGap(cluster)
    const budget = buttonShown ? cluster.clientWidth - buttonWidth - clusterGap : cluster.clientWidth
    const count = countVisibleFilters({
      budget,
      gap: clusterGap,
      itemWidths: itemWidths as number[],
      overflowButtonWidth: buttonShown ? 0 : buttonWidth,
    })
    const nextSignature = currentItems.map((item) => item.key).join("|")
    setLayout((prev) => {
      if (prev && prev.signature === nextSignature && prev.visibleCount === count) return prev
      return { signature: nextSignature, visibleCount: count }
    })
  }

  useEffect(() => {
    if (overflowItems.length === 0 && isFiltersOpen) onFiltersClose()
  }, [overflowItems.length, isFiltersOpen, onFiltersClose])

  useEffect(() => {
    if (!isFiltersOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (filtersTriggerRef.current?.contains(target)) return
      if (target.closest(".chakra-popover__popper, .react-datepicker, .react-datepicker-popper")) return
      onFiltersClose()
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [isFiltersOpen, onFiltersClose])

  useLayoutEffect(() => {
    recomputeRef.current()
    const observer = new ResizeObserver(() => recomputeRef.current())
    ;[outerRef.current, clusterRef.current, measureRef.current, filtersTriggerRef.current].forEach((element) => {
      if (element) observer.observe(element)
    })
    itemElements.current.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [signature, visibleCount, filtersLabel])

  const renderItem = (item: ISingleLineFilterItem) => (
    <Box key={item.key} ref={itemRef(item.key)} flex="0 0 auto" w="fit-content">
      {item.node}
    </Box>
  )

  return (
    <Flex ref={outerRef} position="relative" w="full" minW={0} align="center" gap={3} wrap="nowrap">
      <FiltersButton ref={measureRef} label={filtersLabel} isActive={activeOverflowCount > 0} measure />
      {leading && (
        <Flex flex="0 0 auto" align="center" gap={3}>
          {leading}
        </Flex>
      )}
      <Flex ref={clusterRef} flex="1" minW={0} align="center" justifyContent="flex-end" gap={3} wrap="nowrap">
        {visibleItems.length > 0 && (
          <Flex
            minW={0}
            flex="0 1 auto"
            align="center"
            justifyContent="flex-end"
            gap={3}
            wrap="nowrap"
            overflow="hidden"
          >
            {visibleItems.map(renderItem)}
          </Flex>
        )}
        {overflowItems.length > 0 && (
          <Box ref={filtersTriggerRef} flex="0 0 auto" minW="max-content">
            <Popover
              isOpen={isFiltersOpen}
              onOpen={onFiltersOpen}
              onClose={onFiltersClose}
              closeOnBlur={false}
              placement="bottom-start"
              strategy="fixed"
            >
              <PopoverTrigger>
                <FiltersButton label={filtersLabel} isActive={activeOverflowCount > 0} />
              </PopoverTrigger>
              <Portal>
                <PopoverContent w="auto" p={3} zIndex="dropdown" overflow="visible">
                  <PopoverBody p={0}>
                    <VStack align="flex-start" spacing={3}>
                      {overflowItems.map(renderItem)}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </Box>
        )}
      </Flex>
      {trailing && <Box flex="0 0 auto">{trailing}</Box>}
    </Flex>
  )
}

const FiltersButton = React.forwardRef<
  HTMLButtonElement,
  { label: string; isActive: boolean; measure?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function FiltersButton({ label, isActive, measure, ...props }, ref) {
  return (
    <Button
      ref={ref}
      variant="secondary"
      size="sm"
      fontWeight="normal"
      flexShrink={0}
      leftIcon={<Funnel />}
      rightIcon={<CaretDown />}
      bg={isActive ? "background.blueLight" : undefined}
      borderColor={isActive ? "theme.blueActive" : undefined}
      {...props}
      {...(measure
        ? {
            position: "absolute" as const,
            visibility: "hidden" as const,
            pointerEvents: "none" as const,
            w: "max-content",
            tabIndex: -1,
            "aria-hidden": true,
          }
        : {})}
    >
      {label}
    </Button>
  )
})
