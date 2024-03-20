import { Button, Flex, FlexProps, HStack, Text } from "@chakra-ui/react"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

// TODO: Kept on hold as api is not verified. Implement feedback bar when we have proper docs for api
interface IProps extends Partial<FlexProps> {}

type TFeedbackState = "initial" | "reasonForNo" | "thanks" | "done"

const mainTextStyles = {
  color: "theme.blue",
  fontWeight: 700,
}

export function FeedbackBar(containerProps: IProps) {
  const { t } = useTranslation()
  const [feedbackState, setFeedbackState] = React.useState<TFeedbackState>("initial")
  const {} = useForm()

  const handleYes = async () => {
    setFeedbackState("thanks")
  }

  const handleNo = async () => {
    setFeedbackState("reasonForNo")
  }

  const handleReasonForNo = async (reason) => {
    setFeedbackState("thanks")
  }

  const getFeedbackScreen = () => {
    switch (feedbackState) {
      case "initial":
        return <InitialFeedbackQuestion handleYes={handleYes} handleNo={handleNo} />
      case "thanks":
        return <ResponseThanks />
      default:
        return <InitialFeedbackQuestion handleYes={handleYes} handleNo={handleNo} />
    }
  }

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="center"
      gap={4}
      p={4}
      align="center"
      bg="greys.grey04"
      {...containerProps}
    >
      {getFeedbackScreen()}
    </Flex>
  )
}

function InitialFeedbackQuestion({
  handleYes,
  handleNo,
}: {
  handleYes: () => Promise<void>
  handleNo: () => Promise<void>
}) {
  const { t } = useTranslation()
  return (
    <>
      <Text {...mainTextStyles}>{t("site.didYouFind")}</Text>
      <HStack gap={3}>
        <Button variant="secondary" onClick={handleYes}>
          {t("ui.yes")}
        </Button>
        <Button variant="secondary" onClick={handleNo}>
          {t("ui.no")}
        </Button>
      </HStack>
    </>
  )
}

function ResponseThanks() {
  const { t } = useTranslation()
  return <Text {...mainTextStyles}>{t("site.thankYouForResponse")}</Text>
}
