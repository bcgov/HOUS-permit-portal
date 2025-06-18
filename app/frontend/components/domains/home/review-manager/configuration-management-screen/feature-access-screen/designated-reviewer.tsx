import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"

export const designatedReviewerScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction } = useJurisdiction()
  const navigate = useNavigate()
  const { t } = useTranslation()
  //const [isEnabled, setIsEnabled] = useState(currentJurisdiction?.designatedReviewer ?? false)

  // const handleToggle = (checked) => {
  //   setIsEnabled(checked)
  //   currentJurisdiction.update({ designatedReviewer: checked })
  // }

  return <Container maxW="container.lg" p={8} as={"main"}></Container>
})
