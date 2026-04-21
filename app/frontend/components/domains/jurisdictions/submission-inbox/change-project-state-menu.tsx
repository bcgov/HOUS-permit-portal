import { Button, IconButton, Menu, MenuButton, MenuItem, MenuList, Portal, Tooltip } from "@chakra-ui/react"
import { Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../../models/permit-project"

interface IChangeProjectStateMenuProps {
  project: IPermitProject
  /**
   * When true, renders a ghost IconButton with the Swap icon (used inside
   * kanban cards). Otherwise renders a text link-style button with the
   * "Change state" label.
   */
  compact?: boolean
  triggerLabel?: string
}

export const ChangeProjectStateMenu = observer(function ChangeProjectStateMenu({
  project,
  compact = false,
  triggerLabel,
}: IChangeProjectStateMenuProps) {
  const { t } = useTranslation()

  if (project.allowedManualTransitions.length === 0) return null

  return (
    <Menu>
      {compact ? (
        <Tooltip label={t("submissionInbox.changeStatus")} hasArrow placement="top">
          <MenuButton
            as={IconButton}
            aria-label={t("submissionInbox.changeStatus")}
            icon={<Swap size={16} />}
            size="sm"
            minW={7}
            h={7}
            variant="ghost"
          />
        </Tooltip>
      ) : (
        <MenuButton as={Button} variant="link" fontWeight="normal" color="text.link" textDecoration="underline">
          {triggerLabel ?? t("submissionInbox.changeState")}
        </MenuButton>
      )}
      <Portal>
        <MenuList zIndex={10}>
          {project.allowedManualTransitions.map((transition) => (
            <MenuItem
              key={transition}
              fontSize="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                project.transitionState(transition)
              }}
            >
              {/* @ts-ignore */}
              {t(`submissionInbox.projectStates.${transition}`)}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
  )
})
