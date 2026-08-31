import { Box, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Wrap, WrapItem } from "@chakra-ui/react"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { IReportSort, IReportTable } from "../../../../types/report"
import { toCamelCase } from "../../../../utils/utility-functions"

interface IProps {
  table: IReportTable
}

export function ReportTable({ table }: IProps) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<IReportSort | null>(table.defaultSort ?? null)
  const mixColumn = table.columns.find((column) => isMixColumn(column.key))
  const columns = table.columns.filter((column) => !isMixColumn(column.key))

  useEffect(() => {
    setSort(table.defaultSort ?? null)
  }, [table.key, table.defaultSort?.key, table.defaultSort?.direction])

  const rows = useMemo(() => {
    if (!sort) return table.rows
    const direction = sort.direction === "asc" ? 1 : -1
    return [...table.rows].sort((a, b) => compareValues(rowValue(a, sort.key), rowValue(b, sort.key)) * direction)
  }, [table.rows, sort])

  const onSort = (key: string) => {
    if (!table.sortable) return
    setSort((previous) => {
      if (previous?.key === key) {
        return { key, direction: previous.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "desc" }
    })
  }

  return (
    <Box w="full">
      <TableContainer w="full" overflowX="auto">
        <Table size="sm" variant="simple" w="full">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.key}
                  cursor={table.sortable ? "pointer" : undefined}
                  onClick={table.sortable ? () => onSort(column.key) : undefined}
                  onKeyDown={
                    table.sortable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onSort(column.key)
                          }
                        }
                      : undefined
                  }
                  tabIndex={table.sortable ? 0 : undefined}
                  aria-sort={ariaSort(sort, column.key)}
                  whiteSpace="normal"
                  verticalAlign="bottom"
                  minW={column.key === "template" ? "12rem" : "5.5rem"}
                  px={3}
                  textAlign={isNumericColumn(column.key) ? "end" : "start"}
                >
                  <HStack
                    spacing={1}
                    align="flex-end"
                    justify={isNumericColumn(column.key) ? "flex-end" : "flex-start"}
                  >
                    <Text as="span" lineHeight="short">
                      {column.label}
                    </Text>
                    {table.sortable && sort?.key === column.key ? (
                      sort.direction === "asc" ? (
                        <CaretUp size={12} />
                      ) : (
                        <CaretDown size={12} />
                      )
                    ) : null}
                  </HStack>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.length === 0 ? (
              <Tr>
                <Td colSpan={Math.max(columns.length, 1)}>
                  <Text color="text.secondary">{t("reporting.shell.emptyTable")}</Text>
                </Td>
              </Tr>
            ) : (
              rows.map((row, index) => (
                <Tr key={index}>
                  {columns.map((column) => (
                    <Td
                      key={column.key}
                      whiteSpace={column.key === "template" ? "normal" : "nowrap"}
                      verticalAlign="top"
                      px={3}
                      py={3}
                      textAlign={isNumericColumn(column.key) ? "end" : "start"}
                    >
                      <Text as="span" fontWeight={column.key === "template" ? "medium" : "normal"}>
                        {formatCell(rowValue(row, column.key))}
                      </Text>
                      {column.key === "template" && mixColumn ? (
                        <Box mt={2}>
                          <MixTags value={String(rowValue(row, mixColumn.key) ?? "")} />
                        </Box>
                      ) : null}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

function isMixColumn(key: string) {
  return key === "status_mix" || key === "statusMix"
}

function isNumericColumn(key: string) {
  return (
    key !== "template" &&
    key !== "jurisdiction" &&
    key !== "category" &&
    key !== "status" &&
    key !== "metric" &&
    key !== "outcome" &&
    key !== "bucket" &&
    key !== "group" &&
    key !== "role" &&
    key !== "period" &&
    key !== "label" &&
    key !== "document_type" &&
    key !== "documentType"
  )
}

function rowValue(row: Record<string, string | number | null>, key: string) {
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key]
  const camelKey = toCamelCase(key)
  if (camelKey !== key && Object.prototype.hasOwnProperty.call(row, camelKey)) {
    return row[camelKey]
  }
  return undefined
}

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" })
}

function ariaSort(sort: IReportSort | null, key: string) {
  if (sort?.key !== key) return "none"
  return sort.direction === "asc" ? "ascending" : "descending"
}

function formatCell(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—"
  return value
}

function MixTags({ value }: { value: string }) {
  if (!value || value === "—") return null
  const parts = value.split(", ").filter((part) => /:\s*\d+$/.test(part))
  if (parts.length === 0) return null

  return (
    <Wrap spacing={1}>
      {parts.map((part) => (
        <WrapItem key={part}>
          <Text
            as="span"
            fontSize="xs"
            lineHeight="short"
            px={2}
            py={0.5}
            borderRadius="sm"
            bg="greys.grey03"
            color="text.secondary"
            fontWeight="normal"
            textTransform="none"
          >
            {part}
          </Text>
        </WrapItem>
      ))}
    </Wrap>
  )
}
