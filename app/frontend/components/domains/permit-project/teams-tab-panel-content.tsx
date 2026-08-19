import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Plus, UsersThree, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { IProjectMembership } from "../../../models/project-membership"
import {
  COLLABORATOR_ACCESS_ORDER,
  MEETING_ACCESS_ORDER,
  PROJECT_ACCESS_ORDER,
} from "../../../models/project-permissions"
import { IProjectTeam } from "../../../models/project-team"
import { EFlashMessageStatus, EProjectTeamKind } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { InfoTooltip } from "../../shared/info-tooltip"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"
import { RequestLoadingButton } from "../../shared/request-loading-button"

interface IProps {
  permitProject: IPermitProject
}

export const TeamsTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10} gap={8}>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <UsersThree size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.teams.title")}
          </Heading>
        </HStack>
        <Text color="text.secondary">{t("permitProject.teams.description")}</Text>
      </Box>

      <Box as="section">
        <Heading as="h3" size="md" mb={4}>
          {t("permitProject.teams.autoTeamsTitle")}
        </Heading>
        <CustomMessageBox status={EFlashMessageStatus.info} description={t("permitProject.teams.autoTeamsHint")} />
        <Stack spacing={6} mt={4}>
          {permitProject.autoTeams.map((team) => (
            <TeamCard key={team.id} permitProject={permitProject} team={team} />
          ))}
        </Stack>
      </Box>

      <CustomTeamsSection permitProject={permitProject} />
    </Flex>
  )
})

const CustomTeamsSection = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const customTeams = permitProject.customTeams
  const canManage = permitProject.canManageCollaborators

  return (
    <Box as="section">
      <Heading as="h3" size="md" mb={4}>
        {t("permitProject.teams.customTeamsTitle")}
      </Heading>
      <Text color="text.secondary" mb={4}>
        {t("permitProject.teams.customTeamsHint")}
      </Text>

      <Stack spacing={6}>
        {customTeams.map((team) => (
          <TeamCard key={team.id} permitProject={permitProject} team={team} />
        ))}
        {customTeams.length === 0 && <Text color="text.secondary">{t("permitProject.teams.customTeamsEmpty")}</Text>}
        {canManage && <AddTeamForm permitProject={permitProject} />}
      </Stack>
    </Box>
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
    <Box border="1px solid" borderColor="border.light" borderRadius="sm" p={6}>
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
        <Button variant="primary" isDisabled={!name.trim() || isSubmitting} isLoading={isSubmitting} onClick={onSubmit}>
          {t("permitProject.teams.saveTeam")}
        </Button>
        <Button variant="secondary" onClick={close}>
          {t("ui.cancel")}
        </Button>
      </HStack>
    </Box>
  )
})

const ACCESS_ORDER_BY_DOMAIN = {
  projectAccess: PROJECT_ACCESS_ORDER,
  collaboratorAccess: COLLABORATOR_ACCESS_ORDER,
  meetingAccess: MEETING_ACCESS_ORDER,
} as const

type TAutoTeamKind = Exclude<EProjectTeamKind, EProjectTeamKind.custom>

const TeamCard = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const members = permitProject.membershipsForTeam(team)
  const canManage = permitProject.canManageCollaborators
  const isCustom = team.kind === EProjectTeamKind.custom
  // Only the auto kinds have an explainer; custom teams are named by the user.
  const autoKindTooltip = isCustom ? "" : t(`permitProject.teams.kindTooltip.${team.kind as TAutoTeamKind}`)

  return (
    <Box border="1px solid" borderColor="border.light" borderRadius="sm" p={6}>
      <Flex justify="space-between" align="flex-start" mb={4} gap={4} wrap="wrap">
        <Box>
          <HStack spacing={1} align="center" mb={1}>
            {isCustom && canManage ? (
              <TeamNameEditor permitProject={permitProject} team={team} />
            ) : (
              <Heading as="h4" size="sm" mb={0}>
                {isCustom ? team.name : t(`permitProject.teams.kind.${team.kind as EProjectTeamKind}`)}
              </Heading>
            )}
            {!isCustom && (
              <InfoTooltip
                hasArrow
                placement="top"
                maxW="320px"
                whiteSpace="normal"
                label={autoKindTooltip}
                ariaLabel={autoKindTooltip}
              />
            )}
          </HStack>
          <Text fontSize="sm" color="text.secondary">
            {t("permitProject.teams.memberCount", { count: members.length })}
          </Text>
        </Box>
        {isCustom && canManage && <RemoveTeamButton permitProject={permitProject} team={team} />}
      </Flex>

      <Flex gap={4} wrap="wrap" mb={isCustom ? 6 : 0}>
        {(Object.keys(ACCESS_ORDER_BY_DOMAIN) as Array<keyof typeof ACCESS_ORDER_BY_DOMAIN>).map((domain) => (
          <FormControl key={domain} w="260px">
            <FormLabel>{t(`permitProject.teams.permissions.${domain}`)}</FormLabel>
            <Select
              value={team[domain]}
              isDisabled={!canManage}
              onChange={(e) => permitProject.updateProjectTeam(team.id, { [domain]: e.target.value } as any)}
            >
              {ACCESS_ORDER_BY_DOMAIN[domain].map((level) => (
                <option key={level} value={level}>
                  {t(`permitProject.teams.${domain}.${level}` as any)}
                </option>
              ))}
            </Select>
          </FormControl>
        ))}
      </Flex>

      {isCustom ? (
        <CustomTeamMembers permitProject={permitProject} team={team} />
      ) : (
        <Text fontSize="sm">{members.map((membership) => membership.name).join(", ")}</Text>
      )}
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
        fontSize: "md",
        maxLength: 100,
        "aria-label": t("permitProject.teams.renameTeam"),
        onSubmit: () => commit(name),
      }}
      editablePreviewProps={{
        fontWeight: 700,
        fontSize: "md",
      }}
    />
  )
})

const CustomTeamMembers = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const members = permitProject.membershipsForTeam(team)
  const canManage = permitProject.canManageCollaborators
  const assignable = permitProject.projectMemberships.filter(
    (membership) => !team.projectMembershipIds.includes(membership.id)
  )

  const setMembers = (membershipIds: string[]) =>
    permitProject.updateProjectTeam(team.id, { projectMembershipIds: membershipIds })

  return (
    <Box>
      <Text fontWeight="bold" fontSize="sm" mb={2}>
        {t("permitProject.teams.members")}
      </Text>
      {members.length === 0 ? (
        <Text fontSize="sm" color="text.secondary" mb={canManage ? 3 : 0}>
          {t("permitProject.teams.noMembers")}
        </Text>
      ) : (
        <Stack spacing={2} mb={canManage ? 3 : 0}>
          {members.map((membership) => (
            <MemberRow
              key={membership.id}
              membership={membership}
              canManage={canManage}
              onRemove={() => setMembers(team.projectMembershipIds.filter((id) => id !== membership.id))}
            />
          ))}
        </Stack>
      )}

      {canManage &&
        (assignable.length === 0 ? (
          <Text fontSize="sm" color="text.secondary">
            {t("permitProject.teams.allCollaboratorsAssigned")}
          </Text>
        ) : (
          <Select
            w="260px"
            size="sm"
            value=""
            onChange={(e) => setMembers([...team.projectMembershipIds, e.target.value])}
          >
            <option value="" disabled hidden>
              {t("permitProject.teams.addMember")}
            </option>
            {assignable.map((membership) => (
              <option key={membership.id} value={membership.id}>
                {membership.name || membership.email}
              </option>
            ))}
          </Select>
        ))}
    </Box>
  )
})

const MemberRow = observer(
  ({
    membership,
    canManage,
    onRemove,
  }: {
    membership: IProjectMembership
    canManage: boolean
    onRemove: () => void
  }) => {
    const { t } = useTranslation()

    return (
      <HStack spacing={2}>
        <Text fontSize="sm">{membership.name || membership.email}</Text>
        {membership.isInvitationPending && <Badge>{t("permitProject.collaborators.status.pending")}</Badge>}
        {canManage && (
          <IconButton
            aria-label={t("permitProject.teams.removeMember")}
            icon={<X size={14} />}
            size="xs"
            variant="ghost"
            onClick={onRemove}
          />
        )}
      </HStack>
    )
  }
)

const RemoveTeamButton = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()

  return (
    <RemoveConfirmationModal
      title={t("permitProject.teams.removeConfirmation.title")}
      body={t("permitProject.teams.removeConfirmation.body")}
      onRemove={() => permitProject.destroyProjectTeam(team.id)}
      renderTriggerButton={({ onClick }) => (
        <Button variant="tertiary" color="semantic.error" size="sm" leftIcon={<X size={14} />} onClick={onClick}>
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
