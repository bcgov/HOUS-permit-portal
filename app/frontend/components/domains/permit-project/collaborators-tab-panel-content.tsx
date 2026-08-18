import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { DotsThreeVertical, PaperPlaneTilt, Plus, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { IProjectMembership } from "../../../models/project-membership"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EProjectMembershipRole, EProjectTeamKind } from "../../../types/enums"
import { UserInput } from "../../shared/base/inputs/user-input"
import { InfoTooltip } from "../../shared/info-tooltip"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"
import { RequestLoadingButton } from "../../shared/request-loading-button"

interface IProps {
  permitProject: IPermitProject
}

type TInviteFormData = {
  users: {
    firstName?: string
    lastName?: string
    email?: string
    membership: EProjectMembershipRole
  }[]
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
  const defaultUserValues = {
    membership: EProjectMembershipRole.lead,
    email: "",
    firstName: "",
    lastName: "",
  }
  const formMethods = useForm<TInviteFormData>({
    mode: "onChange",
    defaultValues: { users: [defaultUserValues] },
  })
  const { handleSubmit, formState, control, reset } = formMethods
  const { fields, append, remove } = useFieldArray({ control, name: "users" })
  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData: TInviteFormData) => {
    const ok = await permitProject.inviteProjectMemberships(
      formData.users
        .filter((user) => user.email)
        .map((user) => ({
          membership: user.membership,
          email: user.email as string,
        }))
    )
    if (ok) reset({ users: [defaultUserValues] })
  }

  const membershipOptions = Object.values(EProjectMembershipRole).map((membership) => ({
    value: membership,
    label: t(`permitProject.collaborators.membership.${membership}`),
  }))

  return (
    <Box as="section">
      <Heading as="h3" size="md" mb={4}>
        {t("permitProject.collaborators.invite.title")}
      </Heading>
      {/* COLLAB TODO(phase 2): each invite row needs a multi-select of custom
          teams the membership starts on (check off any number). 
          Maybe we can pass in some kind of renderAuxillary prop? */}
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={4}>
            {fields.map((field, index) => (
              <UserInput
                key={field.id}
                index={index}
                remove={remove}
                typeFieldName="membership"
                typeLabel={t("permitProject.collaborators.table.membership")}
                typeTooltip={t("permitProject.collaborators.invite.membershipTooltip")}
                typeOptions={membershipOptions}
                showNameFields={false}
              />
            ))}
            <Button
              type="button"
              variant="tertiary"
              onClick={() => append(defaultUserValues)}
              leftIcon={<Plus size={16} />}
            >
              {t("user.addUser")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isValid || isSubmitting}
              loadingText={t("ui.loading")}
              rightIcon={<PaperPlaneTilt size={16} />}
              alignSelf="flex-start"
            >
              {t("user.sendInvites")}
            </Button>
          </Flex>
        </form>
      </FormProvider>
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
            <Th>
              <HeaderWithTooltip
                label={t("permitProject.collaborators.table.membership")}
                tooltip={t("permitProject.collaborators.table.membershipTooltip")}
              />
            </Th>
            <Th>
              <HeaderWithTooltip
                label={t("permitProject.collaborators.table.teams")}
                tooltip={t("permitProject.collaborators.table.teamsTooltip")}
              />
            </Th>
            <Th>
              <HeaderWithTooltip
                label={t("permitProject.collaborators.table.status")}
                tooltip={t("permitProject.collaborators.table.statusTooltip")}
              />
            </Th>
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
// owner. COLLAB TODO(phase 3): ownership transfer, and jurisdictions as owners.
const OwnerRow = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  return (
    <Tr>
      <Td>{permitProject.ownerName}</Td>
      <Td />
      <Td>
        <HStack spacing={1} align="center">
          <Badge>{t("permitProject.collaborators.membership.owner")}</Badge>
          <InfoTooltip
            hasArrow
            placement="top"
            maxW="320px"
            whiteSpace="normal"
            label={t("permitProject.collaborators.membership.ownerTooltip")}
            ariaLabel={t("permitProject.collaborators.membership.ownerTooltip")}
          />
        </HStack>
      </Td>
      <Td />
      <Td>{t("permitProject.collaborators.status.active")}</Td>
      <Td>
        <OwnerActionsMenu permitProject={permitProject} />
      </Td>
    </Tr>
  )
})

const OwnerActionsMenu = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { uiStore } = useMst()

  if (!permitProject.canManageCollaborators) return null

  return (
    <Menu>
      <MenuButton as={IconButton} aria-label={t("ui.options")} icon={<DotsThreeVertical size={24} />} variant="ghost" />
      <Portal>
        <MenuList>
          <MenuItem onClick={() => uiStore.flashMessage.show(EFlashMessageStatus.error, null, "COLLAB TODO(phase 3)")}>
            {t("permitProject.collaborators.transferStewardship")}
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  )
})

const MembershipRow = observer(({ permitProject, membership }: IProps & { membership: IProjectMembership }) => {
  const { t } = useTranslation()
  const canManage = permitProject.canManageCollaborators

  return (
    <Tr>
      <Td>{membership.name || "—"}</Td>
      <Td>{membership.email}</Td>
      <Td>
        {canManage ? (
          <Select
            size="sm"
            w="180px"
            value={membership.role}
            onChange={(e) => permitProject.updateProjectMembershipRole(membership.id, e.target.value as any)}
          >
            {Object.values(EProjectMembershipRole).map((membershipOption) => (
              <option key={membershipOption} value={membershipOption}>
                {t(`permitProject.collaborators.membership.${membershipOption}`)}
              </option>
            ))}
          </Select>
        ) : (
          <Badge>{t(`permitProject.collaborators.membership.${membership.role}`)}</Badge>
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
        <MembershipActionsMenu permitProject={permitProject} membership={membership} />
      </Td>
    </Tr>
  )
})

const HeaderWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <HStack spacing={1} align="center">
    <Text as="span">{label}</Text>
    <InfoTooltip hasArrow placement="top" maxW="320px" whiteSpace="normal" label={tooltip} ariaLabel={tooltip} />
  </HStack>
)

const MembershipActionsMenu = observer(({ permitProject, membership }: IProps & { membership: IProjectMembership }) => {
  const { t } = useTranslation()
  const canReinvite = membership.isInvitationPending && permitProject.canInviteCollaborators
  const canManage = permitProject.canManageCollaborators

  if (!canReinvite && !canManage) return null

  return (
    <Menu>
      <MenuButton as={IconButton} aria-label={t("ui.options")} icon={<DotsThreeVertical size={24} />} variant="ghost" />
      <Portal>
        <MenuList>
          {canReinvite && (
            <MenuItem onClick={() => permitProject.reinviteProjectMembership(membership.id)}>
              {t("permitProject.collaborators.resendInvite")}
            </MenuItem>
          )}
          {canManage && (
            <RemoveConfirmationModal
              title={t("permitProject.collaborators.removeConfirmation.title")}
              body={t("permitProject.collaborators.removeConfirmation.body")}
              onRemove={() => permitProject.removeProjectMembership(membership.id)}
              renderTriggerButton={({ onClick }) => (
                <MenuItem color="semantic.error" onClick={onClick}>
                  {t("permitProject.collaborators.remove")}
                </MenuItem>
              )}
              renderConfirmationButton={({ onClick }) => (
                <RequestLoadingButton onClick={onClick as () => Promise<any>} variant="primary">
                  {t("ui.remove")}
                </RequestLoadingButton>
              )}
            />
          )}
        </MenuList>
      </Portal>
    </Menu>
  )
})
