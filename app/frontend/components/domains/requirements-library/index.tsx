import {
  Box,
  Button,
  Grid,
  GridItem,
  GridItemProps,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
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
  const tableRequirementBlocks = requirementBlockStore.tableRequirementBlocks
  const { t } = useTranslation()

  useEffect(() => {
    requirementBlockStore.fetchRequirementBlocks()
  }, [])

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
          <GridItem gridColumn={"span 5"} p={6} bg={"greys.grey10"}>
            <Text role={"heading"} as={"h3"} color={"black"} fontSize={"sm"}>
              {t("requirementsLibrary.tableHeading")}
            </Text>
          </GridItem>
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
                <GridItem {...sharedGridItemsStyles}>{requirementBlock.name}</GridItem>
                <GridItem {...sharedGridItemsStyles}>
                  <UnorderedList>
                    {requirementBlock.alphaSortedRequirements.map((requirement) => {
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
      </VStack>
    </Box>
  )
})
