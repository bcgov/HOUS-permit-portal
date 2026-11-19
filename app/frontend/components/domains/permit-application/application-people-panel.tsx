import { Avatar, Box, Button, Flex, IconButton, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { IProjectMembership } from "../../../models/project-membership"
import { useMst } from "../../../setup/root"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"
import { EProjectAccess, EProjectContactDesignation } from "../../../types/enums"
import { IFormJson, IOption } from "../../../types/types"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../shared/modals/confirmation-modal"
import { RouterLink } from "../../shared/navigation/router-link"
import { AsyncSelect } from "../../shared/select/async-select"
import { AddProjectPersonModal } from "../permit-project/add-project-person-modal"

interface IApplicationPeoplePanelProps {
  permitApplication: IPermitApplication
  onClose: () => void
  // Edit page: pin under the permit header. Applications list: fill the column.
  stickyHeaderHeight?: number
  readOnly?: boolean
}

type TPanelView = "summary" | "access" | "contact"
type TAccessMode = "application" | "blocks"

const blockOptions = (formJson: IFormJson | null | undefined): IOption[] => {
  if (!formJson) return []
  return (formJson.components || []).flatMap((section) =>
    (section.components || []).map((block) => ({
      label: block.title || block.legend,
      value: block.id,
    }))
  )
}

export const ApplicationPeoplePanel = observer(function ApplicationPeoplePanel({
  permitApplication,
  onClose,
  stickyHeaderHeight,
  readOnly = false,
}: IApplicationPeoplePanelProps) {
  const { t } = useTranslation()
  const { permitApplicationStore, userStore, permitProjectStore } = useMst()
  const currentUserId = userStore.currentUser?.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<TPanelView>("summary")
  const [adding, setAdding] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<IProjectMembership | null>(null)
  const [accessMode, setAccessMode] = useState<TAccessMode>("blocks")
  const [blockIds, setBlockIds] = useState<string[]>([])
  const [contactId, setContactId] = useState<string | null>(null)
  const [pickedContact, setPickedContact] = useState<IOption | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const project = permitApplication.projectId
    ? permitProjectStore.permitProjectMap.get(permitApplication.projectId)
    : null
  const people = project?.panelMemberships ?? []

  const canChange =
    !readOnly &&
    Boolean(
      permitApplication.currentUserAccess?.editApplication ??
        permitProjectStore.currentPermitProject?.currentUserAccess?.editApplication
    )
  const options = blockOptions(permitApplication.formJson)
  const fullPeople = people.filter((person) => person.access !== EProjectAccess.limited)
  const limitedPeople = people.filter((person) => person.access === EProjectAccess.limited)
  const contact = people.find((person) => person.userId === permitApplication.submitter?.id)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setView("summary")
      if (!permitApplication.formJson) {
        await permitApplicationStore.fetchPermitApplication(permitApplication.id)
      }
      const projectId = permitApplication.projectId
      let loadedProject = projectId ? permitProjectStore.permitProjectMap.get(projectId) : null
      if (!loadedProject && projectId) {
        loadedProject = await permitProjectStore.fetchPermitProject(projectId)
      }
      await Promise.all([loadedProject?.fetchMemberships(), permitApplication.fetchProjectGrants()])
      if (cancelled) return
      const loadedPeople = loadedProject?.panelMemberships ?? []
      setContactId(loadedPeople.find((person) => person.userId === permitApplication.submitter?.id)?.id ?? null)
      setPickedContact(null)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [permitApplication.id])

  const grantsFor = (membershipId: string) => permitApplication.grantsFor(membershipId)

  const grantedLimitedPeople = limitedPeople.filter((person) => grantsFor(person.id).length > 0)
  const ungrantedLimitedPeople = limitedPeople.filter((person) => grantsFor(person.id).length === 0)
  const personOptions: IOption[] = ungrantedLimitedPeople.map((person) => ({ label: person.name, value: person.id }))
  const contactLabel = (name: string, userId: string | null | undefined) =>
    `${name}${currentUserId && currentUserId === userId ? ` ${t("permitApplication.people.you")}` : ""}`
  const storedContact = permitApplication.submitter
  const storedContactName = typeof storedContact?.name === "string" ? storedContact.name : null
  const storedContactOption: IOption | null =
    contact?.id && storedContact && storedContactName
      ? {
          label: contactLabel(storedContactName, storedContact.id),
          value: contact.id,
        }
      : null
  const selectedContactOption =
    pickedContact?.value === contactId
      ? pickedContact
      : storedContactOption?.value === contactId
        ? storedContactOption
        : null

  const loadContactOptions = async (input: string) => {
    const query = input.trim()
    if (!query) return storedContactOption ? [storedContactOption] : []
    const projectId = permitApplication.projectId
    if (!projectId) return []

    const loadedProject =
      permitProjectStore.permitProjectMap.get(projectId) ?? (await permitProjectStore.fetchPermitProject(projectId))
    if (!loadedProject) return []

    const matches = await loadedProject.searchMemberships(query)
    return matches.map((person) => ({ label: contactLabel(person.name, person.userId), value: person.id }))
  }

  const blockName = (blockId: string | null) => options.find((option) => option.value === blockId)?.label

  const accessSummary = (person: IProjectMembership) => {
    const mine = grantsFor(person.id)
    if (mine.some((grant) => grant.kind === "application")) return t("permitApplication.people.entireApplication")
    const names = mine
      .filter((grant) => grant.kind === "block")
      .map((grant) => blockName(grant.requirementBlockId))
      .filter((name): name is string => Boolean(name))
    if (names.length === 0) return t("permitApplication.people.noBlocks")
    return names.join(", ")
  }

  const personLine = (person: IProjectMembership) => {
    const role = person.roleTags.join(", ")
    const access = person.access
      ? t("permitApplication.people.accessLevel", { level: t(`permitProject.people.access.${person.access}`) })
      : ""
    return [role, access].filter(Boolean).join(" · ")
  }

  const openAccess = (person: IProjectMembership) => {
    const mine = grantsFor(person.id)
    setAdding(false)
    setSelectedPerson(person)
    setAccessMode(mine.some((grant) => grant.kind === "application") ? "application" : "blocks")
    setBlockIds(
      mine
        .filter((grant) => grant.kind === "block" && grant.requirementBlockId)
        .map((grant) => grant.requirementBlockId as string)
    )
    setView("access")
  }

  const openAdd = () => {
    setAdding(true)
    setSelectedPerson(null)
    setAccessMode("application")
    setBlockIds([])
    setView("access")
  }

  const saveAccess = async () => {
    if (!selectedPerson) return
    setSaving(true)
    const mine = grantsFor(selectedPerson.id)
    const applicationGrant = mine.find((grant) => grant.kind === "application")
    const blockGrants = mine.filter((grant) => grant.kind === "block")
    let ok = true

    if (accessMode === "application") {
      if (!applicationGrant) {
        ok = await permitApplication.createProjectGrant({
          membershipId: selectedPerson.id,
          kind: "application",
        })
      }
      if (ok) {
        for (const grant of blockGrants) {
          const removed = await permitApplication.destroyProjectGrant(grant.id)
          if (!removed) {
            ok = false
            break
          }
        }
      }
    } else {
      if (applicationGrant) {
        ok = await permitApplication.destroyProjectGrant(applicationGrant.id)
      }
      const wanted = new Set(blockIds)
      if (ok) {
        for (const blockId of blockIds) {
          if (blockGrants.some((grant) => grant.requirementBlockId === blockId)) continue
          const created = await permitApplication.createProjectGrant({
            membershipId: selectedPerson.id,
            kind: "block",
            requirementBlockId: blockId,
          })
          if (!created) {
            ok = false
            break
          }
        }
      }
      if (ok) {
        for (const grant of blockGrants) {
          if (!grant.requirementBlockId || wanted.has(grant.requirementBlockId)) continue
          const removed = await permitApplication.destroyProjectGrant(grant.id)
          if (!removed) {
            ok = false
            break
          }
        }
      }
    }

    if (ok) setView("summary")
    setSaving(false)
  }

  const removeAccess = async () => {
    if (!selectedPerson) return
    setSaving(true)
    let ok = true
    for (const grant of grantsFor(selectedPerson.id)) {
      const removed = await permitApplication.destroyProjectGrant(grant.id)
      if (!removed) {
        ok = false
        break
      }
    }
    if (ok) setView("summary")
    setSaving(false)
  }

  const saveContact = async () => {
    if (!contactId) return
    setSaving(true)
    const ok = await permitApplication.updateSubmitter(contactId)
    if (ok) setView("summary")
    setSaving(false)
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
            {t("permitApplication.people.title")}
          </Text>
          <IconButton aria-label={t("ui.close")} icon={<X />} variant="ghost" onClick={onClose} />
        </Flex>

        <Box flex={1} minH={0} overflowY="auto" px={6} py={8}>
          {loading ? (
            <Flex justify="center" py={10}>
              <SharedSpinner />
            </Flex>
          ) : view === "access" ? (
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
                {t("permitApplication.people.accessTitle")}
              </Text>
              <Text color="text.secondary">{t("permitApplication.people.accessDescription")}</Text>
              {adding ? (
                <>
                  <AsyncSelect<IOption, false>
                    isCreatable={false}
                    defaultOptions={personOptions}
                    loadOptions={(input) => {
                      const query = input.trim().toLowerCase()
                      return Promise.resolve(
                        personOptions.filter((option) => option.label.toLowerCase().includes(query))
                      )
                    }}
                    value={personOptions.find((option) => option.value === selectedPerson?.id) ?? null}
                    onChange={(selected) => {
                      const person = ungrantedLimitedPeople.find((candidate) => candidate.id === selected?.value)
                      setSelectedPerson(person ?? null)
                    }}
                    placeholder={t("permitApplication.blockAccess.peoplePlaceholder")}
                    stylesToMerge={{ control: { height: "auto", minHeight: "var(--chakra-sizes-10)" } }}
                  />
                  {permitApplication.projectId && (
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
                  )}
                </>
              ) : (
                selectedPerson && (
                  <PersonRow
                    person={selectedPerson}
                    line={personLine(selectedPerson)}
                    you={currentUserId === selectedPerson.userId}
                  />
                )
              )}
              <RadioGroup value={accessMode} onChange={(value) => setAccessMode(value as TAccessMode)}>
                <VStack align="stretch" spacing={3}>
                  <Radio value="application">{t("permitApplication.people.entireApplication")}</Radio>
                  <Radio value="blocks">{t("permitApplication.people.specificBlocks")}</Radio>
                </VStack>
              </RadioGroup>
              {accessMode === "blocks" && (
                <AsyncSelect<IOption, true>
                  isCreatable={false}
                  isMulti
                  defaultOptions={options}
                  loadOptions={(input) => {
                    const query = input.trim().toLowerCase()
                    return Promise.resolve(options.filter((option) => option.label.toLowerCase().includes(query)))
                  }}
                  value={options.filter((option) => blockIds.includes(String(option.value)))}
                  onChange={(selected) => setBlockIds((selected || []).map((option) => String(option.value)))}
                  placeholder={t("permitApplication.people.blocksPlaceholder")}
                  stylesToMerge={{ control: { height: "auto", minHeight: "var(--chakra-sizes-10)" } }}
                />
              )}
              {!adding && selectedPerson && (
                <ConfirmationModal
                  promptHeader={t("permitApplication.people.removeAccessTitle")}
                  promptMessage={t("permitApplication.people.removeAccessBody")}
                  confirmText={t("ui.remove")}
                  confirmButtonBg="semantic.error"
                  onConfirm={() => {
                    void removeAccess()
                  }}
                  renderTrigger={(onOpen) => (
                    <Button
                      variant="link"
                      size="sm"
                      px={0}
                      h="auto"
                      minH={0}
                      alignSelf="flex-start"
                      onClick={onOpen}
                      isDisabled={saving}
                    >
                      {t("ui.remove")}
                    </Button>
                  )}
                />
              )}
            </VStack>
          ) : view === "contact" ? (
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
                {t("permitApplication.people.contactTitle")}
              </Text>
              <Text color="text.secondary">{t("permitApplication.people.contactChoose")}</Text>
              <AsyncSelect<IOption, false>
                isCreatable={false}
                defaultOptions={storedContactOption ? [storedContactOption] : []}
                loadOptions={loadContactOptions}
                value={selectedContactOption}
                onChange={(selected) => {
                  if (!selected?.value) {
                    setContactId(null)
                    setPickedContact(null)
                    return
                  }
                  const option = { label: selected.label, value: String(selected.value) }
                  setContactId(option.value)
                  setPickedContact(option)
                }}
                placeholder={t("permitApplication.people.contactPlaceholder")}
                stylesToMerge={{ control: { height: "auto", minHeight: "var(--chakra-sizes-10)" } }}
              />
            </VStack>
          ) : (
            <VStack align="stretch" spacing={10}>
              {permitApplication.projectId && (
                <Box>
                  <Text color="text.secondary" lineHeight="1.6" mb={readOnly ? 0 : 3}>
                    {t("permitApplication.people.manageAccess")}
                  </Text>
                  {!readOnly && (
                    <RouterLink to={`/projects/${permitApplication.projectId}/people`} color="text.link">
                      {t("permitApplication.people.manageAccessLink")}
                    </RouterLink>
                  )}
                </Box>
              )}

              <Box>
                <Text fontWeight="bold" fontSize="md" mb={3}>
                  {t("permitApplication.people.fullTitle")}
                </Text>
                <Text color="text.secondary" lineHeight="1.6" mb={5}>
                  {t("permitApplication.people.fullDescription")}
                </Text>
                <VStack align="stretch" spacing={5}>
                  {fullPeople.map((person) => (
                    <PersonRow
                      key={person.id}
                      person={person}
                      line={personLine(person)}
                      you={currentUserId === person.userId}
                    />
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="bold" fontSize="md" mb={3}>
                  {t("permitApplication.people.standardTitle")}
                </Text>
                <Text color="text.secondary" lineHeight="1.6" mb={5}>
                  {t("permitApplication.people.standardDescription")}
                </Text>
                <VStack align="stretch" spacing={6}>
                  {grantedLimitedPeople.map((person) => (
                    <Box key={person.id}>
                      <PersonRow person={person} line={personLine(person)} you={currentUserId === person.userId} />
                      <Text mt={3} fontSize="sm" color="text.secondary" lineHeight="1.5">
                        {accessSummary(person)}
                      </Text>
                      {canChange && (
                        <Button
                          variant="link"
                          size="sm"
                          px={0}
                          h="auto"
                          minH={0}
                          mt={2}
                          onClick={() => openAccess(person)}
                        >
                          {t("ui.change")}
                        </Button>
                      )}
                    </Box>
                  ))}
                </VStack>
                {canChange && (
                  <Button variant="link" px={0} h="auto" minH={0} mt={4} onClick={openAdd}>
                    {t("permitApplication.people.giveSomeone")}
                  </Button>
                )}
              </Box>

              <Box>
                <Text fontWeight="bold" fontSize="md" mb={3}>
                  {t("permitApplication.people.contactTitle")}
                </Text>
                <Text color="text.secondary" lineHeight="1.6" mb={5}>
                  {t("permitApplication.people.contactDescription")}
                </Text>
                {contact && (
                  <PersonRow
                    person={contact}
                    line={
                      contact.contactDesignation === EProjectContactDesignation.primary
                        ? t("permitApplication.people.projectPrimaryContact")
                        : personLine(contact)
                    }
                    you={currentUserId === contact.userId}
                  />
                )}
                {canChange && (
                  <Button
                    variant="link"
                    size="sm"
                    px={0}
                    h="auto"
                    minH={0}
                    mt={3}
                    onClick={() => {
                      setContactId(contact?.id ?? null)
                      setPickedContact(null)
                      setView("contact")
                    }}
                  >
                    {t("ui.change")}
                  </Button>
                )}
              </Box>
            </VStack>
          )}
        </Box>

        {view !== "summary" && (
          <Flex flexShrink={0} gap={4} px={6} py={4} borderTop="1px solid" borderColor="border.light">
            <Button variant="secondary" onClick={() => setView("summary")} isDisabled={saving}>
              {t("ui.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={view === "access" ? saveAccess : saveContact}
              isDisabled={
                saving ||
                (view === "access" && (!selectedPerson || (adding && accessMode === "blocks" && blockIds.length === 0)))
              }
            >
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
          <Text fontSize="sm" color="text.secondary" lineHeight="1.4" mt={1} noOfLines={2}>
            {line}
          </Text>
        )}
      </Box>
    </Flex>
  )
}
