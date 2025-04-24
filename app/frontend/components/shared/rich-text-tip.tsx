import { Box, BoxProps, Heading, HeadingProps, Link } from "@chakra-ui/react"
import { SealCheck } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Editor } from "./editor/editor"

interface IProps extends BoxProps {
  tip: string
  helpLink: string
  headerProps?: Partial<HeadingProps>
}

export function RichTextTip({ tip, helpLink, headerProps, ...containerProps }: IProps) {
  const { t } = useTranslation()
  return (
    <>
      <Box
        as={"section"}
        w={"full"}
        py={3}
        px={6}
        borderLeft={"4px solid"}
        borderColor={"theme.blueAlt"}
        bg={"theme.blueLight"}
        sx={{
          ".ql-editor": {
            p: 0,
          },
        }}
        {...containerProps}
      >
        <Heading display={"flex"} fontSize={"lg"} color={"theme.blueAlt"} {...headerProps}>
          <SealCheck weight={"fill"} size={"24px"} style={{ marginRight: "6px" }} />
          {t("ui.tip")}
        </Heading>
        <Editor htmlValue={tip} readonly />
      </Box>
      <Link
        href={helpLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", marginTop: "1rem", color: "theme.blueAlt", textDecoration: "underline" }}
      >
        {helpLink}
      </Link>
    </>
  )
}
