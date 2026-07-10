import { Button, HStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"

export const FormActions = observer(({ isSubmitting }: { isSubmitting?: boolean }) => {
  const { t } = useTranslation()
  const { navigateToPrevious, hasPrevious, getMeetingDetailPath, isRequesterEditFlow } = useProjectMeetingNavigation()
  const navigate = useNavigate()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()

  const handleBack = () => {
    if (hasPrevious) {
      navigateToPrevious()
      return
    }

    const detailPath = getMeetingDetailPath()
    if (isRequesterEditFlow && detailPath) {
      navigate(detailPath)
      return
    }

    navigate(`/projects/${permitProjectId}/overview`)
  }

  return (
    <HStack spacing={3} mt={8}>
      <Button variant="secondary" onClick={handleBack}>
        {t("ui.back")}
      </Button>
      <Button type="submit" variant="primary" isLoading={isSubmitting}>
        {t("ui.continue")}
      </Button>
    </HStack>
  )
})
