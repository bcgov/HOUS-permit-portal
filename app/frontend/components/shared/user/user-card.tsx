import { Avatar, HStack, Text } from "@chakra-ui/react"
import React from "react"
import { IUser } from "../../../models/user"

interface IUserCardrops {
  user: IUser | null
  placeholder: JSX.Element
  compact?: boolean
  avatarProps?: { [key: string]: any }
}

export const UserCard = ({ user, compact = false, placeholder, avatarProps = {} }: IUserCardrops) => {
  const { name } = user || {}

  return (
    <HStack>
      {user ? (
        <Avatar.Root size="sm" fontFamily="body" {...avatarProps}>
          <Avatar.Fallback name={name} />
          <Avatar.Image src={null} />
        </Avatar.Root>
      ) : (
        placeholder
      )}
      {!compact && (
        <Text fontSize="sm" color={"black"} fontStyle={"normal"} textTransform="none" letterSpacing="normal">
          {name}
        </Text>
      )}
    </HStack>
  )
}
