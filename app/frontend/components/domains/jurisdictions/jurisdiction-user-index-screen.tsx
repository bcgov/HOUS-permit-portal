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
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/paginator"
import { FullWhiteContainer } from "../../shared/containers/full-white-container"
import { SearchFormControl } from "../../shared/form/search-form-control"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { Can } from "../../shared/user/can"
import { RoleTag } from "../../shared/user/role-tag"

interface IJurisdictionUserIndexScreenProps {}

export const JurisdictionUserIndexScreen = observer(({}: IJurisdictionUserIndexScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      jurisdictionSearch: "",
    },
  })
  const { handleSubmit, register, formState } = formMethods
  const { userStore } = useMst()

  const { currentJurisdiction, error } = useJurisdiction()

  useEffect(() => {
    if (!currentJurisdiction) return
    currentJurisdiction.fetchUsers()
  }, [currentJurisdiction])

  interface ITableHeader {
    key: string
    header: string
  }

  const headers: ITableHeader[] = [
    { key: "role", header: t("user.role") },
    { key: "email", header: t("user.email") },
    { key: "name", header: t("user.name") },
    { key: "date_added", header: t("user.dateAdded") },
    { key: "last_sign_in", header: t("user.lastSignIn") },
  ]

  const onSubmit = async (formData) => {
    // if (await searchUsers(formData)) {
    //   // TODO
    // }
  }

  return (
    <FullWhiteContainer containerMaxW="container.lg">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={6}>
            <Flex gap={6}>
              <Flex direction="column" flex={1}>
                <Heading as="h1">{currentJurisdiction?.qualifiedName}</Heading>
              </Flex>
              <RouterLinkButton alignSelf="flex-end" to={"invite"}>
                {t("user.invite")}
              </RouterLinkButton>
            </Flex>

            <TableContainer borderRadius="md" border="1px solid" borderColor="border.light">
              <Flex justify="space-between" px={6} py={4} bg="greys.grey10" w="full" align="center">
                <Text>{t("user.accounts")}</Text>
                <SearchFormControl fieldName="userSearch" maxW="250px" />
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
                  {currentJurisdiction?.users.map((u, index) => (
                    <Tr key={index}>
                      <Td fontWeight="bold">{<RoleTag role={u.role} />}</Td>
                      <Td fontSize="sm">{u.email}</Td>
                      <Td fontSize="sm">{u.name}</Td>
                      <Td fontSize="sm">{format(u.createdAt, "MMM d, yyyy")}</Td>
                      <Td fontSize="sm">TODO</Td>
                      <Td fontSize="sm" p={0} pr={4}>
                        <HStack gap={4}>
                          <Can action="user:manage" data={{ user: u }}>
                            <RouterLink to={"#"}>{t("ui.manage")}</RouterLink>
                          </Can>
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
