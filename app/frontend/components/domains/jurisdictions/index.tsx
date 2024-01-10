import {
  Button,
  Flex,
  HStack,
  Heading,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { faSort } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/paginator"
import { FullWhiteContainer } from "../../shared/containers/full-white-container"
import { SearchFormControl } from "../../shared/form/search-form-control"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface IJurisdictionIndexScreenProps {}

export const JurisdictionIndexScreen = observer(({}: IJurisdictionIndexScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      jurisdictionSearch: "",
    },
  })
  const { handleSubmit, register, formState } = formMethods
  const { jurisdictionStore } = useMst()
  const { fetchJurisdictions, jurisdictions } = jurisdictionStore

  useEffect(() => {
    fetchJurisdictions()
  }, [])

  interface ITableHeader {
    key: string
    header: string
  }

  const headers: ITableHeader[] = [
    { key: "name", header: "Name" },
    { key: "managers", header: "Managers" },
    { key: "reviewers", header: "Reviewers" },
    { key: "applicationsReceived", header: "Applications Received" },
    { key: "templatesUsed", header: "Templates Used" },
  ]

  const onSubmit = async (formData) => {
    // if (await searchJurisdictions(formData)) {
    //   // TODO
    // }
  }

  return (
    <FullWhiteContainer containerMaxW="container.lg">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={8}>
            <Flex gap={6}>
              <Flex direction="column" flex={1}>
                <Heading as="h1">{t("jurisdiction.indexTitle")}</Heading>
                <Text>{t("jurisdiction.indexDescription")}</Text>
              </Flex>
              <RouterLinkButton alignSelf="flex-end" to={"#"}>
                {t("jurisdiction.createNew")}
              </RouterLinkButton>
            </Flex>

            <TableContainer borderRadius="md" border="1px solid" borderColor="border.light">
              <Flex justify="space-between" px={6} py={4} bg="greys.grey10" w="full" align="center">
                <Text>{t("jurisdiction.localGovernments")}</Text>
                <SearchFormControl fieldName="jurisdictionSearch" maxW="250px" />
              </Flex>
              <Table variant="primary">
                <Thead>
                  <Tr>
                    {headers.map((header) => (
                      <Th key={header.key} pl={0}>
                        <Flex
                          as={Button}
                          textAlign="left"
                          textTransform="capitalize"
                          bg="greys.white"
                          onClick={() => {}}
                          align="center"
                          justify="space-between"
                          w="full"
                          border="2px solid"
                          borderColor="transparent"
                          borderRightColor="border.light"
                          gap={4}
                        >
                          <Text whiteSpace="normal" overflowWrap="normal" noOfLines={2} fontSize="sm">
                            {header.header}
                          </Text>
                          <FontAwesomeIcon style={{ height: 16, width: 16 }} icon={faSort} />
                        </Flex>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {jurisdictions.map((j, index) => (
                    <Tr key={index}>
                      <Td fontWeight="bold">{j.name}</Td>
                      <Td fontSize="sm">{j.reviewManagersSize}</Td>
                      <Td fontSize="sm">{j.reviewersSize}</Td>
                      <Td fontSize="sm">{j.permitApplicationsSize}</Td>
                      <Td fontSize="sm">TODO</Td>
                      <Td fontSize="sm" p={0} pr={4}>
                        <HStack gap={4}>
                          <RouterLink to={`${j.id}/users/invite`}>{t("user.invite")}</RouterLink>
                          <RouterLink to={"#"}>{t("jurisdiction.viewAs")}</RouterLink>
                          <RouterLink to={`${j.id}/users`}>{t("ui.manage")}</RouterLink>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Flex justify="space-between">
              <HStack gap={4}>
                <Select w={20}>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Select>
                <Text>
                  {`N`} {t("ui.totalItems")}
                </Text>
              </HStack>
              <Paginator />
            </Flex>
          </Flex>
        </form>
      </FormProvider>
    </FullWhiteContainer>
  )
})
