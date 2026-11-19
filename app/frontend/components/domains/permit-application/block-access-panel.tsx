import { Avatar, Box, Button, Flex, IconButton, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { IProjectMembership } from "../../../models/project-membership"
import { useMst } from "../../../setup/root"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"
import { EProjectAccess } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"
import { AsyncSelect } from "../../shared/select/async-select"
import { AddProjectPersonModal } from "../permit-project/add-project-person-modal"

interface IBlockAccessPanelProps {
  permitApplication: IPermitApplication
  requirementBlockId: string
  onClose: () => void
  stickyHeaderHeight?: number
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
}: IBlockAccessPanelProps) {
  const { t } = useTranslation()
  const { userStore, permitProjectStore } = useMst()
  const currentUserId = userStore.currentUser?.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<"summary" | "edit">("summary")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)

  const project = permitApplication.projectId
    ? permitProjectStore.permitProjectMap.get(permitApplication.projectId)
    : null
  const people = project?.panelMemberships ?? []
  const grants = permitApplication.projectGrants

  const blockTitle = blockTitleFor(permitApplication, requirementBlockId)
  const peoplePath = permitApplication.projectId ? `/projects/${permitApplication.projectId}/people` : "/projects"

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setView("summary")
      const projectId = permitApplication.projectId
      let loadedProject = projectId ? permitProjectStore.permitProjectMap.get(projectId) : null
      if (!loadedProject && projectId) {
        loadedProject = await permitProjectStore.fetchPermitProject(projectId)
      }
      await Promise.all([loadedProject?.fetchMemberships(), permitApplication.fetchProjectGrants()])
      if (cancelled) return
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [permitApplication.id, requirementBlockId])

  const hasApplicationGrant = (person: IProjectMembership) =>
    grants.some((grant) => grant.projectMembershipId === person.id && grant.kind === "application")

  const blockGrants = grants.filter(
    (grant) => grant.kind === "block" && grant.requirementBlockId === requirementBlockId
  )

  const alreadyEdits = people.filter(
    (person) => person.access !== EProjectAccess.limited || hasApplicationGrant(person)
  )
  const additional = people.filter(
    (person) =>
      person.access === EProjectAccess.limited &&
      !hasApplicationGrant(person) &&
      blockGrants.some((grant) => grant.projectMembershipId === person.id)
  )
  const options = useMemo<IOption[]>(
    () =>
      people
        .filter((person) => person.access === EProjectAccess.limited && !hasApplicationGrant(person))
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
      const created = await permitApplication.createProjectGrant({
        membershipId,
        kind: "block",
        requirementBlockId,
      })
      if (!created) {
        ok = false
        break
      }
    }
    if (ok) {
      for (const grant of blockGrants) {
        if (wanted.has(grant.projectMembershipId)) continue
        const removed = await permitApplication.destroyProjectGrant(grant.id)
        if (!removed) {
          ok = false
          break
        }
      }
    }
    if (ok) setView("summary")
    setSaving(false)
  }

  const projectLine = (person: IProjectMembership) => {
    const role = person.roleTags.join(", ")
    const access =
      person.access === EProjectAccess.limited
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
    <>
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
                <Button
                  variant="link"
                  color="text.link"
                  fontWeight="normal"
                  verticalAlign="baseline"
                  onClick={() => setInviteOpen(true)}
                >
                  {t("permitApplication.blockAccess.addPerson")}
                </Button>
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
          <Flex
            flexShrink={0}
            gap={4}
            px={6}
            py={4}
            borderTop="1px solid"
            borderColor="border.light"
            justify="flex-end"
          >
            <Button variant="secondary" onClick={() => setView("summary")} isDisabled={saving}>
              {t("ui.cancel")}
            </Button>
            <Button variant="primary" onClick={save} isLoading={saving}>
              {t("ui.onlySave")}
            </Button>
          </Flex>
        )}
      </Flex>
      <AddProjectPersonModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={permitApplication.projectId}
        onCreated={() => {
          const projectId = permitApplication.projectId
          const loadedProject = projectId ? permitProjectStore.permitProjectMap.get(projectId) : null
          void loadedProject?.fetchMemberships()
        }}
      />
    </>
  )
})

const PersonRow = ({ person, line, you }: { person: IProjectMembership; line: string; you: boolean }) => {
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
