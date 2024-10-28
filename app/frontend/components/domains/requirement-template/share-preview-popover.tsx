import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Tag,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IUser } from "../../../models/user"
import { useMst } from "../../../setup/root"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { RoleTag } from "../../shared/user/role-tag"

interface ISharePreviewPopoverProps {
  nInvitees?: number
}

export const SharePreviewPopover: React.FC<ISharePreviewPopoverProps> = ({ nInvitees }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const [isInviting, setIsInviting] = useState(false)

  const { userStore } = useMst()

  const { users } = userStore
  const invitees = users

  return (
    <Box>
      <Popover isOpen={isOpen} onClose={onClose}>
        <PopoverTrigger>
          <Button variant="link" onClick={onOpen}>
            {t("earlyAccessRequirementTemplate.index.sharePreviewLink", { n: nInvitees?.toString() ?? "0" })}
          </Button>
        </PopoverTrigger>
        <PopoverContent width="lg">
          <PopoverArrow />
          <PopoverHeader p={4}>
            <Flex justify="space-between" align="center">
              {isInviting ? (
                <>
                  <Heading h="fit-content" mb={0}>
                    {t("earlyAccessRequirementTemplate.index.inviteToPreviewTitle")}
                  </Heading>
                  <PopoverCloseButton size="md" onClick={() => setIsInviting(false)} mt={3} mr={3} />
                </>
              ) : (
                <>
                  <Heading h="fit-content" mb={0}>
                    {t("earlyAccessRequirementTemplate.index.sharePreviewTitle")}
                  </Heading>
                  <HStack>
                    <CopyLinkButton value={"TODO"} />
                    <Button variant="primary" leftIcon={<Plus />} onClick={() => setIsInviting(true)}>
                      {t("ui.invite")}
                    </Button>
                  </HStack>
                </>
              )}
            </Flex>
          </PopoverHeader>

          <PopoverBody maxH="300px" overflowY="auto">
            {isInviting ? (
              <>IS INVITING</>
            ) : (
              [...invitees, ...invitees, ...invitees].map((user) => <InviteeCard key={user.id} user={user} />)
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}

interface InviteeCardProps {
  user: IUser
}

const InviteeCard: React.FC<InviteeCardProps> = ({ user }) => {
  const { name, role, organization, confirmedAt } = user

  return (
    <Flex p={2} borderBottom="1px solid" borderColor="gray.200" align="center" justify="space-between" width="full">
      <InvitationTag user={user} />
      <VStack spacing={0} align="flex-start" flex="1" ml={3}>
        <Text size="lg" color="theme.blue" fontWeight="bold">
          {name}
        </Text>
        <Box fontSize="sm">
          <RoleTag role={user.role} /> {user?.organization}
        </Box>
      </VStack>
      <Button variant="link" size="sm">
        todo
      </Button>
    </Flex>
  )
}

const InvitationTag: React.FC<InviteeCardProps> = ({ user }) => {
  return <Tag>TODO</Tag>
}
