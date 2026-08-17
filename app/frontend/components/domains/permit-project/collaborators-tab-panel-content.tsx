import {
  Badge,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { IProjectMembership } from "../../../models/project-membership"
import { EProjectMembershipRole, EProjectTeamKind } from "../../../types/enums"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"
import { RequestLoadingButton } from "../../shared/request-loading-button"

interface IProps {
  permitProject: IPermitProject
}

export const CollaboratorsTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10} gap={8}>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <Users size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.collaborators.title")}
          </Heading>
        </HStack>
        <Text color="text.secondary">{t("permitProject.collaborators.description")}</Text>
      </Box>

      {permitProject.canInviteCollaborators && <InviteSection permitProject={permitProject} />}

      <CollaboratorsTable permitProject={permitProject} />
    </Flex>
  )
})

const InviteSection = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<EProjectMembershipRole>(EProjectMembershipRole.contributor)

  const onInvite = async () => {
    const response = await permitProject.inviteProjectMembership({
      role,
      user: { email, firstName, lastName },
    })

    if (response.ok) {
      setFirstName("")
      setLastName("")
      setEmail("")
    }
  }

  return (
    <Box as="section" border="1px solid" borderColor="border.light" borderRadius="sm" p={6}>
      <Heading as="h3" size="md" mb={4}>
        {t("permitProject.collaborators.invite.title")}
      </Heading>
      {/* TODO(phase 2): pick a starting team here once custom teams exist. */}
      <Flex gap={4} align="flex-end" wrap="wrap">
        <FormControl w="180px">
          <FormLabel>{t("permitProject.collaborators.invite.firstName")}</FormLabel>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </FormControl>
        <FormControl w="180px">
          <FormLabel>{t("permitProject.collaborators.invite.lastName")}</FormLabel>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </FormControl>
        <FormControl w="260px">
          <FormLabel>{t("permitProject.collaborators.invite.email")}</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl w="200px">
          <FormLabel>{t("permitProject.collaborators.invite.role")}</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value as EProjectMembershipRole)}>
            {Object.values(EProjectMembershipRole).map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {t(`permitProject.collaborators.role.${roleOption}`)}
              </option>
            ))}
          </Select>
        </FormControl>
        <RequestLoadingButton variant="primary" onClick={onInvite} isDisabled={!email}>
          {t("permitProject.collaborators.invite.submit")}
        </RequestLoadingButton>
      </Flex>
    </Box>
  )
})

const CollaboratorsTable = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const memberships = permitProject.projectMemberships

  return (
    <Box as="section" overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            <Th>{t("permitProject.collaborators.table.name")}</Th>
            <Th>{t("permitProject.collaborators.table.email")}</Th>
            <Th>{t("permitProject.collaborators.table.role")}</Th>
            <Th>{t("permitProject.collaborators.table.teams")}</Th>
            <Th>{t("permitProject.collaborators.table.status")}</Th>
            <Th>{t("permitProject.collaborators.table.actions")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          <OwnerRow permitProject={permitProject} />
          {memberships.map((membership) => (
            <MembershipRow key={membership.id} permitProject={permitProject} membership={membership} />
          ))}
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

// The owner has no membership row: full access comes from being the project
// owner. TODO(phase 2): ownership transfer, and jurisdictions as owners.
const OwnerRow = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  return (
    <Tr>
      <Td>{permitProject.ownerName}</Td>
      <Td />
      <Td>
        <Badge>{t("permitProject.collaborators.role.owner")}</Badge>
      </Td>
      <Td />
      <Td>{t("permitProject.collaborators.status.active")}</Td>
      <Td>
        <Text fontSize="sm" color="text.secondary">
          {t("permitProject.collaborators.ownerHint")}
        </Text>
      </Td>
    </Tr>
  )
})

const MembershipRow = observer(({ permitProject, membership }: IProps & { membership: IProjectMembership }) => {
  const { t } = useTranslation()
  const canManage = permitProject.canManageCollaborators

  return (
    <Tr>
      <Td>{membership.name}</Td>
      <Td>{membership.user?.email}</Td>
      <Td>
        {canManage ? (
          <Select
            size="sm"
            w="180px"
            value={membership.role}
            onChange={(e) => permitProject.updateProjectMembershipRole(membership.id, e.target.value as any)}
          >
            {Object.values(EProjectMembershipRole).map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {t(`permitProject.collaborators.role.${roleOption}`)}
              </option>
            ))}
          </Select>
        ) : (
          <Badge>{t(`permitProject.collaborators.role.${membership.role}`)}</Badge>
        )}
      </Td>
      <Td>
        <HStack spacing={1} wrap="wrap">
          {membership.teamKinds.map((kind) => (
            <Badge key={kind} colorScheme="blue">
              {t(`permitProject.teams.kind.${kind as EProjectTeamKind}`)}
            </Badge>
          ))}
        </HStack>
      </Td>
      <Td>
        {membership.isInvitationPending
          ? t("permitProject.collaborators.status.pending")
          : t("permitProject.collaborators.status.active")}
      </Td>
      <Td>
        <HStack spacing={2}>
          {membership.isInvitationPending && permitProject.canInviteCollaborators && (
            <RequestLoadingButton
              size="sm"
              variant="link"
              onClick={() => permitProject.reinviteProjectMembership(membership.id)}
            >
              {t("permitProject.collaborators.resendInvite")}
            </RequestLoadingButton>
          )}
          {canManage && (
            <RemoveConfirmationModal
              title={t("permitProject.collaborators.removeConfirmation.title")}
              body={t("permitProject.collaborators.removeConfirmation.body")}
              triggerText={t("permitProject.collaborators.remove")}
              onRemove={() => permitProject.removeProjectMembership(membership.id)}
              renderConfirmationButton={({ onClick }) => (
                <RequestLoadingButton onClick={onClick as () => Promise<any>} variant="primary">
                  {t("ui.remove")}
                </RequestLoadingButton>
              )}
            />
          )}
        </HStack>
      </Td>
    </Tr>
  )
})
