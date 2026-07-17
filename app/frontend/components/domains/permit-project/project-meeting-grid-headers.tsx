import { Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EProjectMeetingSortFields } from "../../../types/enums"
import { ISort } from "../../../types/types"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

const sortableColumns = [
  EProjectMeetingSortFields.submittedAt,
  EProjectMeetingSortFields.projectDescription,
  EProjectMeetingSortFields.status,
]

export const ProjectMeetingGridHeaders = observer(() => {
  const { t } = useTranslation()
  const { projectMeetingStore } = useMst()
  const { getProjectMeetingSortColumnHeader, toggleSort, sort } = projectMeetingStore

  return (
    <>
      {sortableColumns.map((column) => (
        <GridHeader key={column}>
          <Flex
            w="full"
            as="button"
            justifyContent="space-between"
            cursor="pointer"
            onClick={() => toggleSort(column)}
            px={4}
          >
            <Text textAlign="left">{getProjectMeetingSortColumnHeader(column)}</Text>
            <SortIcon<EProjectMeetingSortFields>
              field={column}
              currentSort={sort as ISort<EProjectMeetingSortFields>}
            />
          </Flex>
        </GridHeader>
      ))}
      <GridHeader>
        <Text px={4}>{t("permitProject.meetings.columns.notes")}</Text>
      </GridHeader>
    </>
  )
})
