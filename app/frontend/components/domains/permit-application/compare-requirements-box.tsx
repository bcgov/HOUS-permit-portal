import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  ListItem,
  OrderedList,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretDown, CaretUp, Warning } from "@phosphor-icons/react"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ICompareRequirementsBoxData, ICompareRequirementsBoxDiff } from "../../../types/types"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface ICompareRequirementsBoxDataProps {
  data: ICompareRequirementsBoxDiff
  handleUpdatePermitApplicationVersion?: () => void
  showCompareAfter?: boolean
  handleClickDismiss?: () => void
}

export const CompareRequirementsBox = ({
  data,
  handleUpdatePermitApplicationVersion,
  showCompareAfter = false,
  handleClickDismiss,
}: ICompareRequirementsBoxDataProps) => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  return (
    <Box
      key={"template-changes"}
      bgColor={"semantic.warningLight"}
      borderColor={"semantic.warning"}
      borderWidth={"1px"}
      borderRadius="lg"
      minH="85px"
      maxH="calc(100vh - 600px)"
      w="340px"
      zIndex={11}
      id="floating-side-box"
      overflow="hidden"
      p={0}
      position="fixed"
      top="380px"
      right="0"
      mt="12"
      mr="6"
      ml="auto"
    >
      <Box p={4}>
        <Flex direction="column">
          <Flex align="center" justify="space-between">
            <Box color={"semantic.warning"}>
              <Warning size={24} aria-label={"warning icon"} />
            </Box>

            {(data.added || data.changed || data.removed) && (
              <Heading as="h3" mb="0" fontSize="xl" overflowWrap={"break-word"}>
                {t("requirementTemplate.edit.diffBox.title")}
              </Heading>
            )}
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <CaretUp /> : <CaretDown />}
              variant={"secondary"}
              size={"sm"}
              aria-label={"Open errors"}
            ></IconButton>
          </Flex>
          {currentUser.isSubmitter ? (
            <Button
              variant="primary"
              alignSelf="center"
              mt={2}
              color="greys.white"
              onClick={showCompareAfter ? handleClickDismiss : handleUpdatePermitApplicationVersion}
            >
              {showCompareAfter ? t("ui.dismiss") : t("requirementTemplate.edit.diffBox.updateToNewVersion")}
            </Button>
          ) : (
            <RouterLinkButton to="#" alignSelf="center" mt={2} color="greys.white">
              {t("ui.dismiss")}
            </RouterLinkButton>
          )}
        </Flex>
      </Box>
      <Box
        overflowY="auto"
        p={4}
        maxH={`calc(100vh - 360px - 85px)`}
        display={isOpen ? "block" : "none"}
        borderTop="1px solid"
        borderColor="semantic.warning"
      >
        <Text fontSize="sm" mt="2">
          {t("requirementTemplate.edit.diffBox.instructions")}
        </Text>

        <Flex direction="column" mt={4}>
          {(showCompareAfter || !currentUser.isSubmitter) && !R.isEmpty(data.added) && (
            <>
              <Heading as="h3">{t("requirementTemplate.edit.diffBox.added")}</Heading>
              <Divider borderColor="black" my={0} />
              <CompareRequirementsList data={data.added} />
            </>
          )}

          {!R.isEmpty(data.changed) && (
            <>
              <Heading as="h3">{t("requirementTemplate.edit.diffBox.changed")}</Heading>
              <Divider borderColor="black" my={0} />
              <CompareRequirementsList data={data.changed} />
            </>
          )}

          {!showCompareAfter && !R.isEmpty(data.removed) && (
            <>
              <Heading as="h3">{t("requirementTemplate.edit.diffBox.removed")}</Heading>
              <Divider borderColor="black" my={0} />
              <CompareRequirementsList data={data.removed} />
            </>
          )}
        </Flex>
      </Box>
    </Box>
  )
}

interface ICompareRequirementsListProps {
  data: ICompareRequirementsBoxData[]
}

const CompareRequirementsList: React.FC<ICompareRequirementsListProps> = ({ data }) => {
  const partitionedData = data.reduce(
    (acc, item) => {
      const section = item.diffSectionLabel
      if (!acc[section]) {
        acc[section] = []
      }
      acc[section].push(item)
      return acc
    },
    {} as Record<string, ICompareRequirementsBoxData[]>
  )

  return (
    <>
      {Object.keys(partitionedData).map((sectionLabel, index) => (
        <Box key={index}>
          <Heading as="h4" fontSize="lg" mt={1}>
            {sectionLabel}
          </Heading>
          <OrderedList
            mt="2"
            ml="0"
            fontSize="sm"
            sx={{
              "li a": {
                color: "text.primary",
              },
            }}
          >
            {partitionedData[sectionLabel].map((item, idx) => (
              <ListItem key={idx}>
                <ScrollLink key={item.id} to={item.class || item.id}>
                  {item.label}
                </ScrollLink>
              </ListItem>
            ))}
          </OrderedList>
        </Box>
      ))}
    </>
  )
}
