import { Tooltip } from "@/components/ui/tooltip"
import { Button, IconButton, Menu, Portal } from "@chakra-ui/react"
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
    <Menu.Root>
      {compact ? (
        <Tooltip
          content={t("submissionInbox.changeStatus")}
          showArrow
          positioning={{
            placement: "top",
          }}
        >
          <Menu.Trigger asChild>
            <IconButton
              aria-label={t("submissionInbox.changeStatus")}
              icon={<Swap size={16} />}
              size="sm"
              minW={7}
              h={7}
              variant="ghost"
            ></IconButton>
          </Menu.Trigger>
        </Tooltip>
      ) : (
        <Menu.Trigger asChild>
          <Button variant="link" fontWeight="normal" color="text.link" textDecoration="underline">
            {triggerLabel ?? t("submissionInbox.changeState")}
          </Button>
        </Menu.Trigger>
      )}
      <Portal>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {project.allowedManualTransitions.map((transition) => (
                <Menu.Item
                  key={transition}
                  fontSize="sm"
                  onSelect={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    project.transitionState(transition)
                  }}
                  value="item-0"
                >
                  {/* @ts-ignore */}
                  {t(`submissionInbox.projectStates.${transition}`)}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Portal>
    </Menu.Root>
  )
})
