import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretLeft, PaperPlaneTilt, Plus, Users, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { IProjectMembership } from "../../../models/project-membership"
import {
  COLLABORATOR_ACCESS_ORDER,
  MEETING_ACCESS_ORDER,
  PROJECT_ACCESS_ORDER,
} from "../../../models/project-permissions"
import { IProjectTeam } from "../../../models/project-team"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EProjectMembershipRole, EProjectTeamKind } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { EmptyResultsBox } from "../../shared/grid/empty-results-box"
import { InfoTooltip } from "../../shared/info-tooltip"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"
import { RequestLoadingButton } from "../../shared/request-loading-button"
import { TagsSelect } from "../../shared/select/selectors/tags-select"

interface IProps {
  permitProject: IPermitProject
}

type TInviteFormData = {
  users: {
    email?: string
    membership: EProjectMembershipRole
    extraTeams?: IOption[]
  }[]
}

const ACCESS_ORDER_BY_DOMAIN = {
  projectAccess: PROJECT_ACCESS_ORDER,
  collaboratorAccess: COLLABORATOR_ACCESS_ORDER,
  meetingAccess: MEETING_ACCESS_ORDER,
} as const

type TAccessDomain = keyof typeof ACCESS_ORDER_BY_DOMAIN
type TAutoTeamKind = Exclude<EProjectTeamKind, EProjectTeamKind.custom>

const ACCESS_DOMAINS = Object.keys(ACCESS_ORDER_BY_DOMAIN) as TAccessDomain[]

// The steward is not a membership, so selection needs an id no membership can own.
const STEWARD_SELECTION = "steward"

const customTeamsOf = (membership: IProjectMembership) =>
  membership.teams.filter((team) => team.kind === EProjectTeamKind.custom)

const filterOptions = (options: IOption[], query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter((option) => option.label.toLowerCase().includes(q))
}

// Permissions are additive, so a person's real access is the highest level any
// of their teams grants — the thing the per-group matrix makes you work out.
const highestAccessOf = (teams: IProjectTeam[]) =>
  Object.fromEntries(
    ACCESS_DOMAINS.map((domain) => {
      const order = ACCESS_ORDER_BY_DOMAIN[domain] as readonly string[]
      const highest = teams.reduce(
        (winner, team) => (order.indexOf(team[domain]) > order.indexOf(winner) ? (team[domain] as string) : winner),
        order[0]
      )
      return [domain, highest]
    })
  ) as Record<TAccessDomain, string>

const FULL_ACCESS = Object.fromEntries(
  ACCESS_DOMAINS.map((domain) => {
    const order = ACCESS_ORDER_BY_DOMAIN[domain] as readonly string[]
    return [domain, order[order.length - 1]]
  })
) as Record<TAccessDomain, string>

const effectiveAccessFor = (permitProject: IPermitProject, membership: IProjectMembership) =>
  highestAccessOf(
    membership.teams
      .map((membershipTeam) => permitProject.projectTeams.find((team) => team.id === membershipTeam.id))
      .filter(Boolean) as IProjectTeam[]
  )

export const CollaboratorsTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const openPerson = (id: string) => {
    setSelectedId(id)
    onOpen()
  }

  const openAccess = () => {
    setSelectedId(null)
    onOpen()
  }

  const closeDrawer = () => {
    onClose()
    setSelectedId(null)
  }

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10} gap={8}>
      <Box as="section">
        <Flex align="center" justify="space-between" gap={6} wrap="wrap" mb={4}>
          <HStack align="center" spacing={4}>
            <Users size={32} />
            <Heading as="h2" size="lg" mb={0}>
              {t("permitProject.collaborators.title")}
            </Heading>
          </HStack>
          {permitProject.canViewCollaborators && (
            <HStack spacing={3}>
              <Button variant="secondary" onClick={openAccess}>
                {t("permitProject.teams.accessTitle")}
              </Button>
              <InviteButton permitProject={permitProject} />
            </HStack>
          )}
        </Flex>
        {!permitProject.canViewCollaborators ? (
          <EmptyResultsBox description={t("permitProject.collaborators.noAccess")} icon={<Users size={18} />} mt={2} />
        ) : (
          <Text color="text.secondary">{t("permitProject.collaborators.description")}</Text>
        )}
      </Box>

      {permitProject.canViewCollaborators && (
        <Box as="section">
          <PeopleTable permitProject={permitProject} selectedId={isOpen ? selectedId : null} onSelect={openPerson} />
        </Box>
      )}

      <Drawer isOpen={isOpen} placement="right" onClose={closeDrawer} size="md">
        <DrawerOverlay />
        <DrawerContent maxW="430px" pt="var(--app-navbar-height)">
          <DrawerCloseButton />
          <DrawerBody px={6} pt={4} pb={8}>
            <DetailPane permitProject={permitProject} selectedId={selectedId} onClearSelection={openAccess} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
})

const InviteButton = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  if (!permitProject.canManageCollaborators) return null

  return (
    <>
      <Button variant="primary" leftIcon={<Plus size={16} />} onClick={onOpen}>
        {t("permitProject.collaborators.invite.title")}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("permitProject.collaborators.invite.title")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <InviteForm permitProject={permitProject} onSuccess={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
})

const InviteForm = observer(({ permitProject, onSuccess }: IProps & { onSuccess: () => void }) => {
  const { t } = useTranslation()
  const defaultUserValues = {
    membership: EProjectMembershipRole.lead,
    email: "",
    extraTeams: [] as IOption[],
  }
  const formMethods = useForm<TInviteFormData>({
    mode: "onChange",
    defaultValues: { users: [defaultUserValues] },
  })
  const { handleSubmit, formState, control, reset } = formMethods
  const { fields, append, remove } = useFieldArray({ control, name: "users" })
  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData: TInviteFormData) => {
    const users = []
    for (const user of formData.users) {
      if (!user.email) continue
      const projectTeamIds = await resolveTeamOptions(permitProject, user.extraTeams ?? [])
      users.push({
        membership: user.membership,
        email: user.email,
        projectTeamIds,
      })
    }
    const ok = await permitProject.inviteProjectMemberships(users)
    if (ok) {
      reset({ users: [defaultUserValues] })
      onSuccess()
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text color="text.secondary" mb={6}>
          {t("permitProject.collaborators.invite.membershipTooltip")}
        </Text>
        <Flex direction="column" gap={4}>
          {fields.map((field, index) => (
            <Box
              key={field.id}
              display="grid"
              gridTemplateColumns="minmax(0, 1.4fr) 140px minmax(0, 1fr) 40px"
              gap={3}
              alignItems="end"
            >
              <EmailFormControl
                fieldName={`users.${index}.email`}
                validate
                required
                showOptional={false}
                hideLabel={index > 0}
              />
              <FormControl>
                {index === 0 && <FormLabel mb={2}>{t("permitProject.collaborators.table.role")}</FormLabel>}
                <Controller
                  control={control}
                  name={`users.${index}.membership`}
                  render={({ field: { value, onChange } }) => (
                    <Select value={value} onChange={onChange} aria-label={t("permitProject.collaborators.table.role")}>
                      {Object.values(EProjectMembershipRole).map((membership) => (
                        <option key={membership} value={membership}>
                          {t(`permitProject.collaborators.membership.${membership}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl>
                {index === 0 && <FormLabel mb={2}>{t("permitProject.collaborators.table.extraTeams")}</FormLabel>}
                <Controller
                  control={control}
                  name={`users.${index}.extraTeams`}
                  render={({ field: { value, onChange } }) => (
                    <CustomTeamTagsSelect
                      permitProject={permitProject}
                      selectedOptions={value ?? []}
                      onChange={onChange}
                    />
                  )}
                />
              </FormControl>
              {fields.length > 1 ? (
                <IconButton
                  aria-label={t("ui.remove")}
                  icon={<X size={16} />}
                  variant="ghost"
                  size="sm"
                  mb={1}
                  onClick={() => remove(index)}
                />
              ) : (
                <Box />
              )}
            </Box>
          ))}
          <Flex justify="space-between" align="center" pt={2} gap={4}>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => append(defaultUserValues)}
              leftIcon={<Plus size={16} />}
            >
              {t("permitProject.collaborators.invite.addAnother")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isValid || isSubmitting}
              loadingText={t("ui.loading")}
              rightIcon={<PaperPlaneTilt size={16} />}
            >
              {t("user.sendInvites")}
            </Button>
          </Flex>
        </Flex>
      </form>
    </FormProvider>
  )
})

interface ISelectionProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

const PeopleTable = observer(({ permitProject, selectedId, onSelect }: IProps & ISelectionProps) => {
  const { t } = useTranslation()
  const memberships = permitProject.projectMemberships

  return (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            <Th>{t("permitProject.collaborators.table.name")}</Th>
            <Th>
              <HeaderWithTooltip
                label={t("permitProject.collaborators.table.role")}
                tooltip={t("permitProject.collaborators.table.roleTooltip")}
              />
            </Th>
            <Th>
              <HeaderWithTooltip
                label={t("permitProject.collaborators.table.extraTeams")}
                tooltip={t("permitProject.collaborators.table.extraTeamsTooltip")}
              />
            </Th>
            <Th>
              <HeaderWithTooltip
                label={t("permitProject.collaborators.table.status")}
                tooltip={t("permitProject.collaborators.table.statusTooltip")}
              />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <PersonRow
            name={permitProject.ownerName}
            isSelected={selectedId === STEWARD_SELECTION}
            onSelect={() => onSelect(STEWARD_SELECTION)}
            roleNode={<Badge>{t("permitProject.collaborators.membership.owner")}</Badge>}
            teamsNode={<Text color="text.secondary">—</Text>}
            statusNode={<Badge variant="success">{t("permitProject.collaborators.status.active")}</Badge>}
          />
          {memberships.map((membership) => {
            const extraTeams = customTeamsOf(membership)
            return (
              <PersonRow
                key={membership.id}
                name={membership.name || membership.email}
                email={membership.name ? membership.email : undefined}
                isSelected={selectedId === membership.id}
                onSelect={() => onSelect(membership.id)}
                roleNode={
                  <Badge>
                    {t(`permitProject.collaborators.membership.${membership.role as EProjectMembershipRole}`)}
                  </Badge>
                }
                teamsNode={
                  extraTeams.length === 0 ? (
                    <Text color="text.secondary">—</Text>
                  ) : (
                    <HStack spacing={1} wrap="wrap">
                      {extraTeams.map((team) => (
                        <Badge key={team.id} colorScheme="blue">
                          {team.name}
                        </Badge>
                      ))}
                    </HStack>
                  )
                }
                statusNode={
                  membership.isInvitationPending ? (
                    <Badge>{t("permitProject.collaborators.status.pending")}</Badge>
                  ) : (
                    <Badge variant="success">{t("permitProject.collaborators.status.active")}</Badge>
                  )
                }
              />
            )
          })}
        </Tbody>
      </Table>
      {memberships.length === 0 && (
        <Text color="text.secondary" mt={4}>
          {t("permitProject.collaborators.empty")}
        </Text>
      )}
    </Box>
  )
})

const PersonRow = ({
  name,
  email,
  roleNode,
  teamsNode,
  statusNode,
  isSelected,
  onSelect,
}: {
  name: string
  email?: string
  roleNode: React.ReactNode
  teamsNode: React.ReactNode
  statusNode: React.ReactNode
  isSelected: boolean
  onSelect: () => void
}) => (
  <Tr
    bg={isSelected ? "semantic.infoLight" : undefined}
    _hover={{ bg: isSelected ? "semantic.infoLight" : "greys.grey04" }}
  >
    <Td>
      <Button
        variant="link"
        color="text.primary"
        fontWeight="bold"
        whiteSpace="normal"
        textAlign="left"
        onClick={onSelect}
      >
        {name || "—"}
      </Button>
      {email && (
        <Text fontSize="sm" color="text.secondary">
          {email}
        </Text>
      )}
    </Td>
    <Td>{roleNode}</Td>
    <Td>{teamsNode}</Td>
    <Td>{statusNode}</Td>
  </Tr>
)

const DetailPane = observer(
  ({
    permitProject,
    selectedId,
    onClearSelection,
  }: IProps & { selectedId: string | null; onClearSelection: () => void }) => {
    const selectedMembership = permitProject.projectMemberships.find((membership) => membership.id === selectedId)

    if (selectedId === STEWARD_SELECTION) {
      return <StewardDetail permitProject={permitProject} onClearSelection={onClearSelection} />
    }
    if (selectedMembership) {
      return (
        <PersonDetail
          permitProject={permitProject}
          membership={selectedMembership}
          onClearSelection={onClearSelection}
        />
      )
    }
    return <AccessPane permitProject={permitProject} />
  }
)

const BackToAccessButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <Button variant="tertiary" size="sm" leftIcon={<CaretLeft size={14} />} onClick={onClick} mb={4} alignSelf="start">
      {t("permitProject.collaborators.detail.backToAccess")}
    </Button>
  )
}

const StewardDetail = observer(({ permitProject, onClearSelection }: IProps & { onClearSelection: () => void }) => {
  const { t } = useTranslation()
  const { uiStore } = useMst()

  return (
    <Flex direction="column">
      <BackToAccessButton onClick={onClearSelection} />
      <Heading as="h3" size="md" mb={1}>
        {permitProject.ownerName}
      </Heading>
      <Badge alignSelf="start" mb={4}>
        {t("permitProject.collaborators.membership.owner")}
      </Badge>
      <Text fontSize="sm" color="text.secondary" mb={6}>
        {t("permitProject.collaborators.membership.ownerTooltip")}
      </Text>
      <EffectiveAccessList access={FULL_ACCESS} />
      {permitProject.canManageCollaborators && (
        <Button
          variant="tertiary"
          size="sm"
          mt={6}
          alignSelf="start"
          onClick={() => uiStore.flashMessage.show(EFlashMessageStatus.error, null, "COLLAB TODO(phase 3)")}
        >
          {t("permitProject.collaborators.transferStewardship")}
        </Button>
      )}
    </Flex>
  )
})

const PersonDetail = observer(
  ({
    permitProject,
    membership,
    onClearSelection,
  }: IProps & { membership: IProjectMembership; onClearSelection: () => void }) => {
    const { t } = useTranslation()
    const canManage = permitProject.canManageCollaborators
    const extraTeams = customTeamsOf(membership)

    return (
      <Flex direction="column">
        <BackToAccessButton onClick={onClearSelection} />
        <Heading as="h3" size="md" mb={1}>
          {membership.name || membership.email}
        </Heading>
        {membership.name && (
          <Text fontSize="sm" color="text.secondary">
            {membership.email}
          </Text>
        )}
        <Badge alignSelf="start" mt={2} variant={membership.isInvitationPending ? undefined : "success"}>
          {membership.isInvitationPending
            ? t("permitProject.collaborators.status.pending")
            : t("permitProject.collaborators.status.active")}
        </Badge>

        <FormControl mt={6}>
          <FormLabel>{t("permitProject.collaborators.table.role")}</FormLabel>
          {canManage ? (
            <Select
              value={membership.role}
              onChange={(e) => permitProject.updateProjectMembershipRole(membership.id, e.target.value as any)}
            >
              {Object.values(EProjectMembershipRole).map((role) => (
                <option key={role} value={role}>
                  {t(`permitProject.collaborators.membership.${role}`)}
                </option>
              ))}
            </Select>
          ) : (
            <Badge>{t(`permitProject.collaborators.membership.${membership.role}`)}</Badge>
          )}
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>{t("permitProject.collaborators.table.extraTeams")}</FormLabel>
          {canManage ? (
            <CustomTeamTagsSelect
              permitProject={permitProject}
              selectedOptions={extraTeams.map((team) => ({ value: team.id, label: team.name }))}
              onChange={async (options) => {
                const teamIds = await resolveTeamOptions(permitProject, options)
                await syncMembershipCustomTeams(permitProject, membership.id, teamIds)
              }}
            />
          ) : extraTeams.length === 0 ? (
            <Text color="text.secondary">—</Text>
          ) : (
            <HStack spacing={1} wrap="wrap">
              {extraTeams.map((team) => (
                <Badge key={team.id} colorScheme="blue">
                  {team.name}
                </Badge>
              ))}
            </HStack>
          )}
        </FormControl>

        <Divider my={6} />
        <EffectiveAccessList
          access={effectiveAccessFor(permitProject, membership)}
          note={membership.isInvitationPending ? t("permitProject.collaborators.detail.pendingHint") : undefined}
        />

        {canManage && (
          <HStack spacing={3} mt={6}>
            {membership.isInvitationPending && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => permitProject.reinviteProjectMembership(membership.id)}
              >
                {t("permitProject.collaborators.resendInvite")}
              </Button>
            )}
            <RemoveConfirmationModal
              title={t("permitProject.collaborators.removeConfirmation.title")}
              body={t("permitProject.collaborators.removeConfirmation.body")}
              onRemove={async () => {
                const response = await permitProject.removeProjectMembership(membership.id)
                if (response?.ok) onClearSelection()
              }}
              renderTriggerButton={({ onClick }) => (
                <Button variant="tertiary" size="sm" color="semantic.error" onClick={onClick}>
                  {t("permitProject.collaborators.remove")}
                </Button>
              )}
              renderConfirmationButton={({ onClick }) => (
                <RequestLoadingButton onClick={onClick as () => Promise<any>} variant="primary">
                  {t("ui.remove")}
                </RequestLoadingButton>
              )}
            />
          </HStack>
        )}
      </Flex>
    )
  }
)

const EffectiveAccessList = ({ access, note }: { access: Record<TAccessDomain, string>; note?: string }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <HStack spacing={1} align="center" mb={1}>
        <Heading as="h4" size="sm" mb={0}>
          {t("permitProject.collaborators.detail.effectiveAccess")}
        </Heading>
        <InfoTooltip
          hasArrow
          placement="top"
          maxW="320px"
          whiteSpace="normal"
          label={t("permitProject.collaborators.detail.effectiveAccessHint")}
          ariaLabel={t("permitProject.collaborators.detail.effectiveAccessHint")}
        />
      </HStack>
      <Stack spacing={2} mt={3}>
        {ACCESS_DOMAINS.map((domain) => (
          <Flex key={domain} justify="space-between" gap={3}>
            <Text fontSize="sm" color="text.secondary">
              {t(`permitProject.teams.permissions.${domain}`)}
            </Text>
            <Text fontSize="sm" fontWeight="bold">
              {t(`permitProject.teams.${domain}.${access[domain]}` as any)}
            </Text>
          </Flex>
        ))}
      </Stack>
      {note && (
        <Text fontSize="sm" color="text.secondary" mt={3}>
          {note}
        </Text>
      )}
    </Box>
  )
}

const AccessPane = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column">
      <Heading as="h3" size="md" mb={2}>
        {t("permitProject.teams.accessTitle")}
      </Heading>
      <Text fontSize="sm" color="text.secondary" mb={6}>
        {t("permitProject.teams.accessDescription")}
      </Text>
      {permitProject.autoTeams.map((team) => (
        <GroupAccessBlock key={team.id} permitProject={permitProject} team={team} />
      ))}
      <Divider my={4} />
      <CustomTeamsSection permitProject={permitProject} />
    </Flex>
  )
})

const GroupAccessBlock = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const tooltip = t(`permitProject.teams.kindTooltip.${team.kind as TAutoTeamKind}`)

  return (
    <Box mb={5}>
      <HStack spacing={1} align="center" mb={2}>
        <Text fontWeight="bold">{t(`permitProject.teams.kind.${team.kind as EProjectTeamKind}`)}</Text>
        <InfoTooltip hasArrow placement="top" maxW="320px" whiteSpace="normal" label={tooltip} ariaLabel={tooltip} />
      </HStack>
      <PermissionRows permitProject={permitProject} team={team} />
    </Box>
  )
})

const PermissionRows = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const canManage = permitProject.canManageCollaborators

  return (
    <Stack spacing={2}>
      {ACCESS_DOMAINS.map((domain) => (
        <Flex key={domain} align="center" justify="space-between" gap={3}>
          <Text fontSize="sm" color="text.secondary">
            {t(`permitProject.teams.permissions.${domain}`)}
          </Text>
          <Box w="150px" flexShrink={0}>
            <PermissionSelect
              team={team}
              domain={domain}
              canManage={canManage}
              onChange={(value) => permitProject.updateProjectTeam(team.id, { [domain]: value } as any)}
            />
          </Box>
        </Flex>
      ))}
    </Stack>
  )
})

const PermissionSelect = observer(
  ({
    team,
    domain,
    canManage,
    onChange,
  }: {
    team: IProjectTeam
    domain: TAccessDomain
    canManage: boolean
    onChange: (value: string) => void
  }) => {
    const { t } = useTranslation()
    const value = team[domain]

    if (!canManage) {
      return (
        <Text fontSize="sm" fontWeight="bold" textAlign="right">
          {t(`permitProject.teams.${domain}.${value}` as any)}
        </Text>
      )
    }

    return (
      <Select
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t(`permitProject.teams.permissions.${domain}`)}
      >
        {ACCESS_ORDER_BY_DOMAIN[domain].map((level) => (
          <option key={level} value={level}>
            {t(`permitProject.teams.${domain}.${level}` as any)}
          </option>
        ))}
      </Select>
    )
  }
)

const CustomTeamsSection = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const customTeams = permitProject.customTeams
  const canManage = permitProject.canManageCollaborators

  return (
    <Box>
      <Heading as="h4" size="sm" mb={2}>
        {t("permitProject.teams.customTeamsTitle")}
      </Heading>
      <Text fontSize="sm" color="text.secondary" mb={4}>
        {t("permitProject.teams.customTeamsHint")}
      </Text>
      {customTeams.length === 0 && (
        <Text fontSize="sm" color="text.secondary" mb={4}>
          {t("permitProject.teams.customTeamsEmpty")}
        </Text>
      )}
      {customTeams.length > 0 && (
        <Accordion allowMultiple mb={4}>
          {customTeams.map((team) => (
            <CustomTeamItem key={team.id} permitProject={permitProject} team={team} />
          ))}
        </Accordion>
      )}
      {canManage && <AddTeamForm permitProject={permitProject} />}
    </Box>
  )
})

const CustomTeamItem = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const members = permitProject.membershipsForTeam(team)
  const canManage = permitProject.canManageCollaborators
  const memberOptions = permitProject.projectMemberships.map((membership) => ({
    value: membership.id,
    label: membership.name || membership.email,
  }))

  return (
    <AccordionItem border="1px solid" borderColor="border.light" borderRadius="md" mb={3} px={2}>
      <AccordionButton _hover={{ bg: "transparent" }} py={3}>
        <AccordionIcon mr={2} />
        <Flex flex={1} align="center" justify="space-between" gap={3} minW={0}>
          <Text fontWeight="bold" noOfLines={1}>
            {team.name}
          </Text>
          <Text fontSize="sm" color="text.secondary" flexShrink={0}>
            {t("permitProject.teams.memberCount", { count: members.length })}
          </Text>
        </Flex>
      </AccordionButton>
      <AccordionPanel pb={6}>
        {canManage && (
          <Box mb={4}>
            <TeamNameEditor permitProject={permitProject} team={team} />
          </Box>
        )}
        <PermissionRows permitProject={permitProject} team={team} />
        <FormControl mt={4}>
          <FormLabel>{t("permitProject.teams.members")}</FormLabel>
          {canManage ? (
            <TagsSelect
              isCreatable={false}
              placeholder={t("permitProject.teams.addMember")}
              selectedOptions={members.map((membership) => ({
                value: membership.id,
                label: membership.name || membership.email,
              }))}
              fetchOptions={async (query) => filterOptions(memberOptions, query)}
              onChange={(options) =>
                permitProject.updateProjectTeam(team.id, {
                  projectMembershipIds: options.map((option) => option.value),
                })
              }
            />
          ) : members.length === 0 ? (
            <Text fontSize="sm" color="text.secondary">
              {t("permitProject.teams.noMembers")}
            </Text>
          ) : (
            <HStack spacing={1} wrap="wrap">
              {members.map((membership) => (
                <Badge key={membership.id}>{membership.name || membership.email}</Badge>
              ))}
            </HStack>
          )}
        </FormControl>
        {canManage && <RemoveTeamButton permitProject={permitProject} team={team} />}
      </AccordionPanel>
    </AccordionItem>
  )
})

const AddTeamForm = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const close = () => {
    setIsOpen(false)
    setName("")
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await permitProject.createProjectTeam({ name: name.trim() })
      if (response.ok) close()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button variant="tertiary" leftIcon={<Plus size={16} />} onClick={() => setIsOpen(true)} alignSelf="flex-start">
        {t("permitProject.teams.addTeam")}
      </Button>
    )
  }

  return (
    <Box border="1px solid" borderColor="border.light" borderRadius="md" p={4}>
      <FormControl mb={4}>
        <FormLabel>{t("permitProject.teams.newTeamName")}</FormLabel>
        <Input
          value={name}
          autoFocus
          maxLength={100}
          placeholder={t("permitProject.teams.newTeamNamePlaceholder")}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <HStack>
        <Button
          variant="primary"
          size="sm"
          isDisabled={!name.trim() || isSubmitting}
          isLoading={isSubmitting}
          onClick={onSubmit}
        >
          {t("permitProject.teams.saveTeam")}
        </Button>
        <Button variant="secondary" size="sm" onClick={close}>
          {t("ui.cancel")}
        </Button>
      </HStack>
    </Box>
  )
})

const TeamNameEditor = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const [name, setName] = useState(team.name)

  const commit = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || trimmed === team.name) {
      setName(team.name)
      return
    }
    permitProject.updateProjectTeam(team.id, { name: trimmed })
  }

  return (
    <EditableInputWithControls
      value={name}
      onChange={setName}
      onCancel={(previousValue) => setName(previousValue)}
      aria-label={t("permitProject.teams.renameTeam")}
      editableInputProps={{
        fontWeight: 700,
        maxLength: 100,
        "aria-label": t("permitProject.teams.renameTeam"),
        onSubmit: () => commit(name),
      }}
      editablePreviewProps={{
        fontWeight: 700,
      }}
    />
  )
})

const RemoveTeamButton = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()

  return (
    <RemoveConfirmationModal
      title={t("permitProject.teams.removeConfirmation.title")}
      body={t("permitProject.teams.removeConfirmation.body")}
      onRemove={() => permitProject.destroyProjectTeam(team.id)}
      renderTriggerButton={({ onClick }) => (
        <Button variant="tertiary" color="semantic.error" size="sm" mt={4} leftIcon={<X size={14} />} onClick={onClick}>
          {t("permitProject.teams.removeTeam")}
        </Button>
      )}
      renderConfirmationButton={({ onClick }) => (
        <RequestLoadingButton onClick={onClick as () => Promise<any>} variant="primary">
          {t("ui.remove")}
        </RequestLoadingButton>
      )}
    />
  )
})

const CustomTeamTagsSelect = observer(
  ({
    permitProject,
    selectedOptions,
    onChange,
  }: {
    permitProject: IPermitProject
    selectedOptions: IOption[]
    onChange: (options: IOption[]) => void
  }) => {
    const { t } = useTranslation()
    const teamOptions = permitProject.customTeams.map((team) => ({ value: team.id, label: team.name }))

    return (
      <TagsSelect
        key={teamOptions.map((option) => option.value).join(",")}
        placeholder={t("permitProject.collaborators.invite.teamsPlaceholder")}
        selectedOptions={selectedOptions}
        fetchOptions={async (query) => filterOptions(teamOptions, query)}
        onChange={(options) => onChange(options)}
        formatCreateLabel={(input) => t("permitProject.teams.createTeam", { name: input })}
      />
    )
  }
)

const HeaderWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <HStack spacing={1} align="center">
    <Text as="span">{label}</Text>
    <InfoTooltip hasArrow placement="top" maxW="320px" whiteSpace="normal" label={tooltip} ariaLabel={tooltip} />
  </HStack>
)

async function resolveTeamOptions(permitProject: IPermitProject, options: IOption[]) {
  const ids: string[] = []
  for (const option of options) {
    const existing = permitProject.customTeams.find(
      (team) => team.id === option.value || team.name.toLowerCase() === option.label.trim().toLowerCase()
    )
    if (existing) {
      ids.push(existing.id)
      continue
    }
    const name = option.label.trim()
    if (!name) continue
    const response = await permitProject.createProjectTeam({ name })
    if (response.ok) ids.push(response.data.data.id)
  }
  return ids
}

async function syncMembershipCustomTeams(permitProject: IPermitProject, membershipId: string, teamIds: string[]) {
  const selected = new Set(teamIds)
  for (const team of permitProject.customTeams) {
    const has = team.projectMembershipIds.includes(membershipId)
    const should = selected.has(team.id)
    if (has === should) continue
    const projectMembershipIds = should
      ? [...team.projectMembershipIds, membershipId]
      : team.projectMembershipIds.filter((id) => id !== membershipId)
    await permitProject.updateProjectTeam(team.id, { projectMembershipIds })
  }
}
