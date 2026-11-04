import { Avatar, Box, Button, Flex, IconButton, Text, VStack } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import Select, { components, OptionProps, SingleValueProps, StylesConfig } from "react-select"
import { EFlashMessageStatus, EProjectAccess, EProjectContactDesignation } from "../../../types/enums"
import { IOption, IProjectPerson } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ConfirmationModal } from "../../shared/modals/confirmation-modal"
import { RouterLink } from "../../shared/navigation/router-link"
import { ProjectAccessTag } from "../../shared/permit-projects/project-access-tag"
import { ProjectRoleSelect } from "../../shared/select/selectors/project-role-select"

interface IContactOption extends IOption<EProjectContactDesignation> {
  isDisabled?: boolean
}

interface IPersonDetailsPanelProps {
  person: IProjectPerson
  canEdit: boolean
  canRemove: boolean
  primaryContactName?: string | null
  isSaving: boolean
  onClose: () => void
  onSave: (changes: {
    roleTags?: string[]
    contactDesignation?: EProjectContactDesignation
    access?: EProjectAccess
  }) => void
  onRemove: () => void
}

type TEditableField = "role" | "contact" | "access"

const AccessOption = (props: OptionProps<IOption<EProjectAccess>, false>) => (
  <components.Option {...props}>
    <ProjectAccessTag access={props.data.value} />
  </components.Option>
)

const AccessValue = (props: SingleValueProps<IOption<EProjectAccess>, false>) => (
  <components.SingleValue {...props}>
    <ProjectAccessTag access={props.data.value} />
  </components.SingleValue>
)

const contactSelectStyles: StylesConfig<IContactOption, false> = {
  control: (css, state) => ({
    ...css,
    borderColor: state.isFocused ? "var(--chakra-colors-focus)" : "var(--chakra-colors-border-light)",
    borderRadius: "6px",
    minHeight: "var(--chakra-sizes-10)",
    boxShadow: "none",
    fontSize: "var(--chakra-fontSizes-sm)",
    ":hover": {
      borderColor: "var(--chakra-colors-border-base)",
    },
  }),
  menuPortal: (css) => ({
    ...css,
    zIndex: 10,
  }),
  option: (css, state) => ({
    ...css,
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    color: "var(--chakra-colors-text-primary)",
    backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
  }),
}

const SectionDivider = () => (
  <Box as="hr" w="full" flexShrink={0} my={0} border="0" borderTop="1px solid" borderColor="border.light" />
)

const sectionTitleProps = { fontWeight: "bold", fontSize: "lg", lineHeight: "short" } as const

export const PersonDetailsPanel = ({
  person,
  canEdit,
  canRemove,
  primaryContactName,
  isSaving,
  onClose,
  onSave,
  onRemove,
}: IPersonDetailsPanelProps) => {
  const { t } = useTranslation()
  const openPrimaryConfirm = useRef<(() => void) | null>(null)
  const isPrimaryContact = person.contactDesignation === EProjectContactDesignation.primary
  const [openField, setOpenField] = useState<TEditableField | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const fieldsDisabled = !canEdit || isSaving

  useEffect(() => {
    setOpenField(null)
    setMenuOpen(false)
  }, [person.id])

  useEffect(() => {
    if (!openField) {
      setMenuOpen(false)
      return
    }

    const timeoutId = window.setTimeout(() => setMenuOpen(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [openField])

  const closeEditor = () => {
    setMenuOpen(false)
    setOpenField(null)
  }

  const contactOptions = useMemo<IContactOption[]>(
    () => [
      { value: EProjectContactDesignation.none, label: t("permitProject.people.notAProjectContact") },
      { value: EProjectContactDesignation.alternate, label: t("permitProject.people.alternateContact") },
      { value: EProjectContactDesignation.primary, label: t("permitProject.people.primaryContact") },
    ],
    [t]
  )
  const contactValue = contactOptions.find((option) => option.value === person.contactDesignation) ?? null
  const accessOptions = useMemo<IOption<EProjectAccess>[]>(
    () =>
      Object.values(EProjectAccess).map((access) => ({
        value: access,
        label: t(`permitProject.people.access.${access}`),
      })),
    [t]
  )
  const accessValue = accessOptions.find((option) => option.value === person.access) ?? null
  const menuIsOpen = (field: TEditableField) => openField === field && menuOpen

  const changeButton = (field: TEditableField) =>
    canEdit ? (
      <Button
        variant="link"
        size="sm"
        h="auto"
        minH={0}
        px={0}
        alignSelf="flex-start"
        textDecoration="none"
        isDisabled={isSaving}
        onClick={() => setOpenField(field)}
      >
        {t("ui.change")}
      </Button>
    ) : null

  return (
    <Flex
      as="aside"
      direction="column"
      w="360px"
      flexShrink={0}
      h="full"
      minH={0}
      overflow="hidden"
      borderLeft="1px solid"
      borderColor="border.light"
      bg="greys.white"
    >
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        px={6}
        py={5}
        flexShrink={0}
        borderBottom="1px solid"
        borderColor="border.light"
      >
        <Flex align="center" gap={3} minW={0}>
          <Avatar name={person.name} size="md" bg="semantic.warningLight" color="text.primary" />
          <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
            {person.name}
          </Text>
        </Flex>
        <IconButton aria-label={t("ui.close")} icon={<X />} variant="ghost" onClick={onClose} />
      </Flex>

      <VStack align="stretch" spacing={6} flex={1} minH={0} overflowY="auto" px={6} py={6}>
        {/* TODO HUB 5774 invitation alert and resend */}
        <CustomMessageBox status={EFlashMessageStatus.info}>
          <Text as="div" fontSize="md">
            {t("permitProject.people.invitationSent", { email: person.email })}{" "}
            <Text as="span" color="text.link" textDecoration="underline">
              {t("permitProject.people.resendInvite")}
            </Text>
          </Text>
        </CustomMessageBox>

        <Box>
          <Text {...sectionTitleProps} mb={3}>
            {t("permitProject.people.personalDetails")}
          </Text>
          {/* TODO HUB 5774 personal details after the invitation is accepted */}
          <Text fontSize="md">{t("permitProject.people.personalDetailsPlaceholder")}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold" fontSize="md" mb={3}>
            {t("permitProject.people.status")}
          </Text>
          {/* TODO HUB 5774 pending invitation status and resend */}
          <VStack align="stretch" spacing={3}>
            <Text fontSize="md">{t("permitProject.people.statusPending")}</Text>
            <Text color="text.link" fontSize="sm">
              {t("permitProject.people.resendInvite")}
            </Text>
          </VStack>
        </Box>

        <SectionDivider />

        <Box>
          <Text {...sectionTitleProps} mb={3}>
            {t("permitProject.people.projectRole")}
          </Text>
          {openField === "role" ? (
            <ProjectRoleSelect
              roleTags={person.roleTags}
              isDisabled={fieldsDisabled}
              menuIsOpen={menuIsOpen("role")}
              onMenuClose={() => {
                if (menuOpen) closeEditor()
              }}
              onChange={(roleTags) => onSave({ roleTags })}
            />
          ) : (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="md">{person.roleTags.join(", ") || t("ui.notProvided")}</Text>
              {changeButton("role")}
            </VStack>
          )}
        </Box>

        <SectionDivider />

        <Box>
          <Text {...sectionTitleProps} mb={3}>
            {t("permitProject.people.projectContact")}
          </Text>
          {openField === "contact" && !isPrimaryContact ? (
            <Select<IContactOption, false>
              autoFocus
              options={contactOptions}
              value={contactValue}
              isDisabled={fieldsDisabled}
              menuIsOpen={menuIsOpen("contact")}
              menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
              menuPosition="fixed"
              styles={contactSelectStyles}
              onMenuClose={() => {
                if (menuOpen) closeEditor()
              }}
              onChange={(option) => {
                if (!option || option.value === person.contactDesignation) return
                if (option.value === EProjectContactDesignation.primary) {
                  closeEditor()
                  openPrimaryConfirm.current?.()
                  return
                }
                onSave({ contactDesignation: option.value })
                closeEditor()
              }}
            />
          ) : (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="md">{contactValue?.label}</Text>
              {canEdit && isPrimaryContact ? (
                <Button
                  variant="link"
                  size="sm"
                  h="auto"
                  minH={0}
                  px={0}
                  alignSelf="flex-start"
                  textDecoration="none"
                  isDisabled
                >
                  {t("ui.change")}
                </Button>
              ) : (
                changeButton("contact")
              )}
            </VStack>
          )}
          <ConfirmationModal
            promptHeader={t("permitProject.people.transferPrimaryTitle")}
            promptMessage={t("permitProject.people.transferPrimaryBody", { name: primaryContactName })}
            confirmText={t("permitProject.people.transferPrimaryConfirm")}
            onConfirm={() => onSave({ contactDesignation: EProjectContactDesignation.primary })}
            renderTrigger={(onOpen) => {
              openPrimaryConfirm.current = onOpen
              return null
            }}
          />
        </Box>

        <SectionDivider />

        <Box>
          <Text {...sectionTitleProps} mb={3}>
            {t("permitProject.people.projectAccess")}
          </Text>
          <VStack align="stretch" spacing={3}>
            {person.access && <ProjectAccessTag access={person.access} alignSelf="flex-start" />}
            {person.access && <Text fontSize="md">{t(`permitProject.people.accessDescription.${person.access}`)}</Text>}
            {person.access && (
              <RouterLink to="/compare-access-levels" color="text.link" fontSize="md" alignSelf="flex-start">
                {t("permitProject.people.compareAccessLevels")}
              </RouterLink>
            )}
            {openField === "access" ? (
              <Select<IOption<EProjectAccess>, false>
                autoFocus
                options={accessOptions}
                value={accessValue}
                isDisabled={fieldsDisabled}
                menuIsOpen={menuIsOpen("access")}
                menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
                menuPosition="fixed"
                components={{ Option: AccessOption, SingleValue: AccessValue }}
                styles={contactSelectStyles as StylesConfig<IOption<EProjectAccess>, false>}
                onMenuClose={() => {
                  if (menuOpen) closeEditor()
                }}
                onChange={(option) => {
                  if (!option || option.value === person.access) return
                  onSave({ access: option.value })
                  closeEditor()
                }}
              />
            ) : (
              changeButton("access")
            )}
          </VStack>
        </Box>

        <Box>
          <Text fontWeight="bold" fontSize="md">
            {t("permitProject.people.additionalAccess")}
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2.5}>
            {t("permitProject.people.additionalAccessPlaceholder")}
          </Text>
        </Box>

        {canRemove && (
          <>
            <SectionDivider />
            <Box>
              <Text {...sectionTitleProps} mb={3}>
                {t("permitProject.people.removePerson")}
              </Text>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="md">{t("permitProject.people.removePersonDescription")}</Text>
                <ConfirmationModal
                  promptHeader={t("permitProject.people.removeConfirmTitle")}
                  promptMessage={t("permitProject.people.removeConfirmBody")}
                  confirmText={t("permitProject.people.removeFromProject")}
                  confirmButtonBg="semantic.error"
                  onConfirm={onRemove}
                  renderTrigger={(onOpen) => (
                    <Button
                      variant="link"
                      size="sm"
                      h="auto"
                      minH={0}
                      px={0}
                      alignSelf="flex-start"
                      textDecoration="none"
                      onClick={onOpen}
                      isDisabled={isSaving}
                    >
                      {t("permitProject.people.removeFromProject")}
                    </Button>
                  )}
                />
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </Flex>
  )
}
