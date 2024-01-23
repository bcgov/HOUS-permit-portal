import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  GridItemProps,
  Heading,
  HStack,
  ListItem,
  Tag,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { Archive } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
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
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
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
          <PerPageSelect
            handleCountPerPageChange={handleCountPerPageChange}
            countPerPage={countPerPage}
            totalCount={totalCount}
          />
          <Paginator
            current={currentPage}
            total={totalCount}
            totalPages={totalPages}
            pageSize={countPerPage}
            handlePageChange={handlePageChange}
          />
        </Flex>

        <Button leftIcon={<Archive size={16} />} variant={"secondary"} mt={3}>
          {t("requirementsLibrary.index.seeArchivedButton")}
        </Button>
      </VStack>
    </Container>
  )
})
