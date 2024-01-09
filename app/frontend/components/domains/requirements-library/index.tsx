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
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/paginator"
import { RouterLink } from "../../shared/navigation/router-link"
import { GridHeaders } from "./grid-header"

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
    setCountPerPage,
    isQuerying,
  } = requirementBlockStore
  const { t } = useTranslation()

  useEffect(() => {
    fetchRequirementBlocks()
  }, [])

  const handlePageChange = (page) => {
    fetchRequirementBlocks({ page })
  }
  const handleCountPerPageChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    setCountPerPage(Number(e.target.value))
    fetchRequirementBlocks()
  }

  return (
    <Box w={"full"} h={"full"} mx={"auto"} bg={"white"}>
      <VStack alignItems={"flex-start"} spacing={8} w={"full"} h={"full"} p={8} maxW={"1170px"} mx={"auto"} as={"main"}>
        <Box>
          <Heading fontSize={"4xl"} color={"text.primary"}>
            {t("requirementsLibrary.title")}
          </Heading>
          <Text color={"text.secondary"} mt={1}>
            {t("requirementsLibrary.description")}
          </Text>
        </Box>

        <Grid
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
                  <Button as={RouterLink} to={`/requirements-library/${requirementBlock.id}/edit`} variant={"link"}>
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
              onChange={handleCountPerPageChange}
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
      </VStack>
    </Box>
  )
})
