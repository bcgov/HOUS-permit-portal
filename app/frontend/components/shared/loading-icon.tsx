import { Box, BoxProps, PropsOf } from "@chakra-ui/react"
import { CustomDomComponent, motion } from "framer-motion"
import React from "react"

const MotionBox = motion<Omit<BoxProps, "transition">>(Box)

interface IProps extends PropsOf<CustomDomComponent<Omit<BoxProps, "transition">>> {
  icon: JSX.Element
}

export const LoadingIcon = ({ icon, ...rest }: IProps) => (
  <MotionBox
    display="inline-block"
    animate={{ rotate: [0, 360], scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
    transition={{
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
    }}
    {...rest}
  >
    {icon}
  </MotionBox>
)
