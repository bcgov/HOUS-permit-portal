import { Icon, IconButton, IconProps, Tooltip } from "@chakra-ui/react"
import { CalendarDots } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

interface IActiveProjectMeetingIndicatorProps extends IconProps {
  to: string
}

export function ActiveProjectMeetingIndicator({
  color = "theme.blueActive",
  to,
  ...iconProps
}: IActiveProjectMeetingIndicatorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // @ts-ignore
  const label = t("submissionInbox.activeProjectMeeting")

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    navigate(to)
  }

  return (
    <Tooltip label={label} hasArrow placement="top">
      <IconButton
        aria-label={label}
        icon={<Icon as={CalendarDots} boxSize={5} color={color} flexShrink={0} {...iconProps} />}
        size="xs"
        minW={5}
        h={5}
        variant="ghost"
        color={color}
        onClick={handleClick}
      />
    </Tooltip>
  )
}
