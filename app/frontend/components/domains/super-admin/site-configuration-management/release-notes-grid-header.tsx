import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EReleaseNoteSortFields } from "../../../../types/enums"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SortIcon } from "../../../shared/sort-icon"

const releaseNoteColumnHeaderGridProps = {
  fontWeight: "normal" as const,
  fontSize: "sm" as const,
  lineHeight: 1.5,
  color: "text.secondary",
  py: 4,
  display: "flex",
  alignItems: "center",
  h: 16,
  whiteSpace: "nowrap",
}

const headerCellDividerProps = {
  px: 4,
  borderRightWidth: "1px" as const,
  borderColor: "border.light",
  w: "full",
}

type ReleaseNoteGridHeaderColumn =
  | {
      type: "text"
      id: string
      i18nKey: string
      showDivider: boolean
    }
  | {
      type: "sortable"
      field: EReleaseNoteSortFields
    }

const RELEASE_NOTE_GRID_HEADER_COLUMNS = [
  {
    type: "text" as const,
    id: "version",
    i18nKey: "releaseNote.columns.version",
    showDivider: true,
  },
  { type: "sortable" as const, field: EReleaseNoteSortFields.releaseDate },
  { type: "sortable" as const, field: EReleaseNoteSortFields.status },
  { type: "sortable" as const, field: EReleaseNoteSortFields.lastEdited },
  {
    type: "text" as const,
    id: "actions",
    i18nKey: "releaseNote.columns.actions",
    showDivider: false,
  },
] satisfies ReadonlyArray<ReleaseNoteGridHeaderColumn>

export const ReleaseNotesGridHeaders = observer(function ReleaseNotesGridHeaders() {
  const { t } = useTranslation()
  const { releaseNoteStore } = useMst()
  const { getSortColumnHeader, toggleSort, sort } = releaseNoteStore

  return (
    <Box display="contents" role="rowgroup">
      <Box display="contents" role="row">
        {RELEASE_NOTE_GRID_HEADER_COLUMNS.map((col) => {
          const key = col.type === "sortable" ? col.field : col.id

          return (
            <GridHeader key={key} {...releaseNoteColumnHeaderGridProps}>
              {col.type === "text" ? (
                <GridItem {...(col.showDivider ? headerCellDividerProps : { px: 4, w: "full" })}>
                  <Text>{t(col.i18nKey)}</Text>
                </GridItem>
              ) : (
                <GridItem {...headerCellDividerProps}>
                  <Flex
                    w="full"
                    as="button"
                    type="button"
                    justifyContent="space-between"
                    cursor="pointer"
                    onClick={() => toggleSort(col.field)}
                    gap={2}
                  >
                    <Text textAlign="left">{getSortColumnHeader(col.field)}</Text>
                    <SortIcon
                      field={col.field}
                      currentSort={sort as any}
                      // Ensure the icon inherits the design-system grey used for headers.
                      color="var(--chakra-colors-greys-grey90)"
                    />
                  </Flex>
                </GridItem>
              )}
            </GridHeader>
          )
        })}
      </Box>
    </Box>
  )
})
