import { Box, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IReportTable } from "../../../types/report"

interface IProps {
  table: IReportTable
}

export function ReportTable({ table }: IProps) {
  const { t } = useTranslation()

  return (
    <Box w="full">
      <TableContainer w="full" overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              {table.columns.map((column) => (
                <Th key={column.key}>{column.label}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {table.rows.length === 0 ? (
              <Tr>
                <Td colSpan={table.columns.length}>
                  <Text color="text.secondary">{t("reporting.shell.emptyTable")}</Text>
                </Td>
              </Tr>
            ) : (
              table.rows.map((row, index) => (
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

function formatCell(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—"
  return value
}
