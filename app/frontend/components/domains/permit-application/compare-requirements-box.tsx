import { Box, Button, Flex, Heading, IconButton, List, Separator, Text, useDisclosure } from "@chakra-ui/react"
import { CaretDown, CaretUp, Warning } from "@phosphor-icons/react"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { ICompareRequirementsBoxData, ICompareRequirementsBoxDiff } from "../../../types/types"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface ICompareRequirementsBoxDataProps {
  data: ICompareRequirementsBoxDiff
  handleUpdatePermitApplicationVersion?: () => void
  showingCompareAfter?: boolean
  handleClickDismiss?: () => void
  isUpdatable?: boolean
}

export const CompareRequirementsBox = ({
  data,
  handleUpdatePermitApplicationVersion,
  showingCompareAfter = false,
  handleClickDismiss,
  isUpdatable,
}: ICompareRequirementsBoxDataProps) => {
  const { t } = useTranslation()

  const { open, onToggle } = useDisclosure({ defaultOpen: true })
  return (
    <Flex
      direction="column"
      key={"template-changes"}
      bgColor={"semantic.warningLight"}
      borderColor={"semantic.warning"}
      borderWidth={"1px"}
      borderRadius="lg"
      minH="200px"
      maxH="calc(80vh - 250px)"
      w="340px"
      zIndex={12}
      id="floating-side-box"
      p={0}
      position="fixed"
      top="275px"
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
            <IconButton onClick={onToggle} variant={"secondary"} size={"sm"} aria-label={"Open errors"}>
              {open ? <CaretUp /> : <CaretDown />}
            </IconButton>
          </Flex>
          {isUpdatable ? (
            <Button
              variant="primary"
              alignSelf="center"
              mt={2}
              color="greys.white"
              onClick={showingCompareAfter ? handleClickDismiss : handleUpdatePermitApplicationVersion}
            >
              {showingCompareAfter ? t("ui.dismiss") : t("requirementTemplate.edit.diffBox.updateToNewVersion")}
            </Button>
          ) : (
            <RouterLinkButton to="#" alignSelf="center" mt={2} color="greys.white">
              {t("ui.dismiss")}
            </RouterLinkButton>
          )}
        </Flex>
      </Box>
      <Box p={4} display={open ? "block" : "none"} borderTop="1px solid" borderColor="semantic.warning" overflow="auto">
        <Text fontSize="sm" mt="2">
          {t("requirementTemplate.edit.diffBox.instructions")}
        </Text>

        <Flex direction="column" mt={4}>
          {(showingCompareAfter || !isUpdatable) && (
            <>
              <Heading as="h3">{t("requirementTemplate.edit.diffBox.added")}</Heading>
              <Separator borderColor="black" my={0} />
              <CompareRequirementsList data={data.added} />
            </>
          )}

          {
            <>
              <Heading as="h3">{t("requirementTemplate.edit.diffBox.changed")}</Heading>
              <Separator borderColor="black" my={0} />
              <CompareRequirementsList data={data.changed} />
            </>
          }

          {!showingCompareAfter && (
            <>
              <Heading as="h3">{t("requirementTemplate.edit.diffBox.removed")}</Heading>
              <Separator borderColor="black" my={0} />
              <CompareRequirementsList data={data.removed} />
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}

interface ICompareRequirementsListProps {
  data: ICompareRequirementsBoxData[]
}

const CompareRequirementsList: React.FC<ICompareRequirementsListProps> = ({ data }) => {
  const { t } = useTranslation()

  if (R.isEmpty(data)) return <Text mb={6}>{t("ui.notApplicable")}</Text>

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
          <List.Root
            as="ol"
            mt="2"
            ml="0"
            fontSize="sm"
            css={{
              "& li a": {
                color: "text.primary",
              },
            }}
          >
            {partitionedData[sectionLabel].map((item, idx) => (
              <List.Item key={idx}>
                <ScrollLink key={item.id} to={item.class || item.id}>
                  {item.label}
                </ScrollLink>
              </List.Item>
            ))}
          </List.Root>
        </Box>
      ))}
    </>
  )
}
