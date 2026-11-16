import { Avatar, Box, Button, Flex, IconButton, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst, useServerAPI } from "../../../setup/root"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"
import { EProjectAccess, EProjectMembershipStatus } from "../../../types/enums"
import { IOption, IProjectGrant, IProjectPerson } from "../../../types/types"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"
import { AsyncSelect } from "../../shared/select/async-select"

interface IBlockAccessPanelProps {
  permitApplication: IPermitApplication
  requirementBlockId: string
  onClose: () => void
  stickyHeaderHeight?: number
  onGrantsChange?: (grants: IProjectGrant[]) => void
}

const loadActivePeople = async (api: ReturnType<typeof useServerAPI>, projectId: string | null) => {
  if (!projectId) return []
  const people: IProjectPerson[] = []
  let page = 1
  let totalPages = 1
  do {
    const response = await api.fetchPermitProjectMemberships(projectId, { page, perPage: 100 })
    if (!response.ok) return people
    people.push(...(response.data?.data ?? []))
    totalPages = response.data?.meta?.totalPages ?? 1
    page += 1
  } while (page <= totalPages)
  return people.filter((person) => person.status === EProjectMembershipStatus.active)
}

const blockTitleFor = (permitApplication: IPermitApplication, requirementBlockId: string) => {
  for (const section of permitApplication.formJson?.components || []) {
    const block = section.components?.find((item) => item.id === requirementBlockId)
    if (block) return block.title || block.legend
  }
  return ""
}

export const BlockAccessPanel = observer(function BlockAccessPanel({
  permitApplication,
  requirementBlockId,
  onClose,
  stickyHeaderHeight,
  onGrantsChange,
}: IBlockAccessPanelProps) {
  const { t } = useTranslation()
  const api = useServerAPI()
  const { userStore } = useMst()
  const currentUserId = userStore.currentUser?.id
  const [people, setPeople] = useState<IProjectPerson[]>([])
  const [grants, setGrants] = useState<IProjectGrant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<"summary" | "edit">("summary")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const blockTitle = blockTitleFor(permitApplication, requirementBlockId)
  const peoplePath = permitApplication.projectId ? `/projects/${permitApplication.projectId}/people` : "/projects"

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setView("summary")
      const [loadedPeople, grantsResponse] = await Promise.all([
        loadActivePeople(api, permitApplication.projectId),
        api.fetchProjectGrants(permitApplication.id),
      ])
      if (cancelled) return
      const loadedGrants = grantsResponse.ok ? (grantsResponse.data?.data ?? []) : []
      setPeople(loadedPeople)
      setGrants(loadedGrants)
      onGrantsChange?.(loadedGrants)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [permitApplication.id, requirementBlockId])

  const hasApplicationGrant = (person: IProjectPerson) =>
    grants.some((grant) => grant.projectMembershipId === person.id && grant.kind === "application")

  const blockGrants = grants.filter(
    (grant) => grant.kind === "block" && grant.requirementBlockId === requirementBlockId
  )

  const alreadyEdits = people.filter(
    (person) => person.access !== EProjectAccess.standard || hasApplicationGrant(person)
  )
  const additional = people.filter(
    (person) =>
      person.access === EProjectAccess.standard &&
      !hasApplicationGrant(person) &&
      blockGrants.some((grant) => grant.projectMembershipId === person.id)
  )
  const options = useMemo<IOption[]>(
    () =>
      people
        .filter((person) => person.access === EProjectAccess.standard && !hasApplicationGrant(person))
        .map((person) => ({ label: person.name, value: person.id })),
    [people, grants]
  )

  const openEditor = () => {
    setSelectedIds(blockGrants.map((grant) => grant.projectMembershipId))
    setView("edit")
  }

  const save = async () => {
    setSaving(true)
    const wanted = new Set(selectedIds)
    let ok = true
    for (const membershipId of selectedIds) {
      if (blockGrants.some((grant) => grant.projectMembershipId === membershipId)) continue
      const created = await api.createProjectGrant(permitApplication.id, {
        membershipId,
        kind: "block",
        requirementBlockId,
      })
      if (!created.ok) {
        ok = false
        break
      }
    }
    if (ok) {
      for (const grant of blockGrants) {
        if (wanted.has(grant.projectMembershipId)) continue
        const removed = await api.destroyProjectGrant(permitApplication.id, grant.id)
        if (!removed.ok) {
          ok = false
          break
        }
      }
    }
    if (ok) {
      const refreshed = await api.fetchProjectGrants(permitApplication.id)
      if (refreshed.ok) {
        const loadedGrants = refreshed.data?.data ?? []
        setGrants(loadedGrants)
        onGrantsChange?.(loadedGrants)
      }
      setView("summary")
    }
    setSaving(false)
  }

  const projectLine = (person: IProjectPerson) => {
    const role = person.roleTags.join(", ")
    const access =
      person.access === EProjectAccess.standard
        ? t("permitApplication.people.entireApplication")
        : t("permitApplication.people.accessLevel", {
            level: t(`permitProject.people.access.${person.access}`),
          })
    return [role, access].filter(Boolean).join(" · ")
  }

  const sticky =
    stickyHeaderHeight == null
      ? { h: "full", minH: 0 }
      : {
          position: "sticky" as const,
          ...stickyBelowNavBar(`${stickyHeaderHeight}px`),
          height: `calc(100vh - ${stickyHeaderHeight}px - var(--app-navbar-offset))`,
        }

  return (
    <Flex
      as="aside"
      direction="column"
      w="360px"
      flexShrink={0}
      overflow="hidden"
      borderLeft="1px solid"
      borderColor="border.light"
      bg="greys.white"
      {...sticky}
    >
      <Flex
        align="center"
        justify="space-between"
        px={6}
        py={6}
        flexShrink={0}
        borderBottom="1px solid"
        borderColor="border.light"
      >
        <Text fontWeight="bold" fontSize="lg">
          {blockTitle}
        </Text>
        <IconButton aria-label={t("ui.close")} icon={<X />} variant="ghost" onClick={onClose} />
      </Flex>

      <Box flex={1} minH={0} overflowY="auto" px={6} py={6}>
        {loading ? (
          <Flex justify="center" py={10}>
            <SharedSpinner />
          </Flex>
        ) : view === "edit" ? (
          <VStack align="stretch" spacing={4}>
            <Button
              variant="link"
              leftIcon={<CaretLeft size={20} />}
              onClick={() => setView("summary")}
              alignSelf="flex-start"
              fontWeight="normal"
              color="text.link"
              px={0}
              h="auto"
              minH={0}
            >
              {t("ui.back")}
            </Button>
            <Text fontWeight="bold" fontSize="lg">
              {t("permitApplication.blockAccess.additionalTitle")}
            </Text>
            <Text color="text.secondary" lineHeight="1.6">
              {t("permitApplication.blockAccess.editorDescription")}
            </Text>
            <Text fontWeight="bold">{t("permitApplication.blockAccess.whoCanEdit", { block: blockTitle })}</Text>
            <AsyncSelect<IOption, true>
              isCreatable={false}
              isMulti
              defaultOptions={options}
              loadOptions={(input) => {
                const query = input.trim().toLowerCase()
                return Promise.resolve(options.filter((option) => option.label.toLowerCase().includes(query)))
              }}
              value={options.filter((option) => selectedIds.includes(String(option.value)))}
              onChange={(selected) => setSelectedIds((selected || []).map((option) => String(option.value)))}
              placeholder={t("permitApplication.blockAccess.peoplePlaceholder")}
              stylesToMerge={{ control: { height: "auto", minHeight: "var(--chakra-sizes-10)" } }}
            />
            <Text color="text.secondary">
              {t("permitApplication.blockAccess.cantFind")}{" "}
              <RouterLink to={peoplePath}>{t("permitApplication.blockAccess.addPerson")}</RouterLink>
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={8}>
            <Box>
              <Text fontWeight="bold" fontSize="md" mb={3}>
                {t("permitApplication.blockAccess.throughProjectTitle")}
              </Text>
              <Text color="text.secondary" lineHeight="1.6" mb={5}>
                {t("permitApplication.blockAccess.throughProjectDescription")}{" "}
                <RouterLink to={peoplePath}>{t("permitApplication.blockAccess.manageProjectAccess")}</RouterLink>
              </Text>
              <VStack align="stretch" spacing={5}>
                {alreadyEdits.map((person) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    line={projectLine(person)}
                    you={currentUserId === person.userId}
                  />
                ))}
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="bold" fontSize="md" mb={3}>
                {t("permitApplication.blockAccess.additionalTitle")}
              </Text>
              <Text color="text.secondary" lineHeight="1.6" mb={5}>
                {t("permitApplication.blockAccess.additionalDescription")}
              </Text>
              {additional.length === 0 ? (
                <>
                  <Text color="text.secondary" mb={3}>
                    {t("permitApplication.blockAccess.none")}
                  </Text>
                  <Button variant="link" px={0} h="auto" minH={0} onClick={openEditor}>
                    {t("permitApplication.blockAccess.giveSomeone")}
                  </Button>
                </>
              ) : (
                <VStack align="stretch" spacing={5}>
                  {additional.map((person) => (
                    <Box key={person.id}>
                      <PersonRow
                        person={person}
                        line={person.roleTags.join(", ")}
                        you={currentUserId === person.userId}
                      />
                      <Button variant="link" size="sm" px={0} h="auto" minH={0} mt={2} onClick={openEditor}>
                        {t("permitApplication.blockAccess.manageEditAccess")}
                      </Button>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        )}
      </Box>

      {view === "edit" && (
        <Flex flexShrink={0} gap={4} px={6} py={4} borderTop="1px solid" borderColor="border.light" justify="flex-end">
          <Button variant="secondary" onClick={() => setView("summary")} isDisabled={saving}>
            {t("ui.cancel")}
          </Button>
          <Button variant="primary" onClick={save} isLoading={saving}>
            {t("ui.onlySave")}
          </Button>
        </Flex>
      )}
    </Flex>
  )
})

const PersonRow = ({ person, line, you }: { person: IProjectPerson; line: string; you: boolean }) => {
  const { t } = useTranslation()
  return (
    <Flex align="center" gap={4}>
      <Avatar name={person.name} size="sm" bg="semantic.warningLight" color="text.primary" />
      <Box minW={0}>
        <Text fontWeight="bold" lineHeight="short" noOfLines={1}>
          {person.name}
          {you ? ` ${t("permitApplication.people.you")}` : ""}
        </Text>
        {line && (
          <Text mt={1} fontSize="sm" color="text.secondary" lineHeight="1.4">
            {line}
          </Text>
        )}
      </Box>
    </Flex>
  )
}
