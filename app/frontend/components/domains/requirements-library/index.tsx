import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  GridItemProps,
  Heading,
  HStack,
  ListItem,
  Select,
  Tag,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/paginator"
import { GridHeaders } from "./grid-header"
import { RequirementsBlockModal } from "./requirements-block-modal"

const sharedGridItemsStyles: Partial<GridItemProps> = {
  p: 4,
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  role: "cell",
  color: "text.primary",
}
export const RequirementsLibraryScreen = observer(function RequirementsLibrary() {
  const { requirementBlockStore } = useMst()
  const {
    tableRequirementBlocks,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    fetchRequirementBlocks,
    handleCountPerPageChange,
    handlePageChange,
  } = requirementBlockStore
  const { t } = useTranslation()

  useEffect(() => {
    fetchRequirementBlocks()
  }, [])

  return (
    <Box w={"full"} h={"full"} mx={"auto"} bg={"white"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"} p={8} maxW={"1170px"} mx={"auto"} as={"main"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading fontSize={"4xl"} color={"text.primary"}>
              {t("requirementsLibrary.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("requirementsLibrary.index.description")}
            </Text>
          </Box>
          <RequirementsBlockModal />
        </Flex>

        <Grid
          mt={3}
          role={"table"}
          templateColumns="repeat(4, 1fr) 85px"
          w="full"
          maxW={"full"}
          overflow={"auto"}
          sx={{
            borderCollapse: "separate",
            ".requirements-library-grid-row:not(:last-of-type) > div": {
              borderBottom: "1px solid",
              borderColor: "border.light",
            },
          }}
          border={"1px solid"}
          borderColor={"border.light"}
          borderRadius={"sm"}
        >
          <GridHeaders />
          {tableRequirementBlocks.map((requirementBlock) => {
            return (
              <Box
                key={requirementBlock.id}
                className={"requirements-library-grid-row"}
                role={"row"}
                display={"contents"}
              >
                <GridItem {...sharedGridItemsStyles} fontWeight={700}>
                  {requirementBlock.name}
                </GridItem>
                <GridItem {...sharedGridItemsStyles}>
                  <HStack as={"ul"} wrap={"wrap"} spacing={1}>
                    {requirementBlock.associations.map((association) => (
                      <Tag key={association} as={"li"} bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"}>
                        {association}
                      </Tag>
                    ))}
                  </HStack>
                </GridItem>
                <GridItem {...sharedGridItemsStyles}>
                  <UnorderedList>
                    {requirementBlock.requirements.map((requirement) => {
                      return (
                        <ListItem key={requirement.id} color={"text.secondary"} fontSize={"xs"}>
                          {requirement.label}
                        </ListItem>
                      )
                    })}
                  </UnorderedList>
                </GridItem>
                <GridItem {...sharedGridItemsStyles} fontSize={"sm"}>
                  {format(requirementBlock.updatedAt, "yyyy-MM-dd")}
                </GridItem>
                <GridItem {...sharedGridItemsStyles} justifyContent={"center"}>
                  <Button variant={"link"} textDecoration={"underline"}>
                    Edit
                  </Button>
                </GridItem>
              </Box>
            )
          })}
        </Grid>
        <Flex w={"full"} justifyContent={"space-between"}>
          <HStack gap={4}>
            <Select
              aria-label={"Number of requirement Blocks per page"}
              w={20}
              onChange={(e) => handleCountPerPageChange(Number(e.target.value))}
              value={countPerPage}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Select>
            <Text>
              {totalCount} {t("ui.totalItems")}
            </Text>
          </HStack>
          <Paginator
            current={currentPage}
            total={totalCount}
            totalPages={totalPages}
            pageSize={countPerPage}
            handlePageChange={handlePageChange}
          />
        </Flex>

        <Button
          leftIcon={<FontAwesomeIcon style={{ width: "14px", height: "14px" }} icon={faBoxArchive} />}
          variant={"secondary"}
          mt={3}
        >
          {t("requirementsLibrary.index.seeArchivedButton")}
        </Button>
      </VStack>
    </Box>
  )
})
