import { Box, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { IReportSort, IReportTable } from "../../../types/report"

interface IProps {
  table: IReportTable
}

export function ReportTable({ table }: IProps) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<IReportSort | null>(table.defaultSort ?? null)

  useEffect(() => {
    setSort(table.defaultSort ?? null)
  }, [table.key, table.defaultSort?.key, table.defaultSort?.direction])

  const rows = useMemo(() => {
    if (!sort) return table.rows
    const direction = sort.direction === "asc" ? 1 : -1
    return [...table.rows].sort((a, b) => compareValues(a[sort.key], b[sort.key]) * direction)
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
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              {table.columns.map((column) => (
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
                >
                  <HStack spacing={1} as="span">
                    <Text as="span">{column.label}</Text>
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
                <Td colSpan={table.columns.length}>
                  <Text color="text.secondary">{t("reporting.shell.emptyTable")}</Text>
                </Td>
              </Tr>
            ) : (
              rows.map((row, index) => (
                <Tr key={index}>
                  {table.columns.map((column) => (
                    <Td key={column.key}>{formatCell(row[column.key])}</Td>
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
