import { Document, Font } from "@react-pdf/renderer"
import React from "react"
import { theme } from "../../../styles/theme"

const chunkSubstr = (str, size) => {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substring(o, Math.min(o + size, str.length))
  }
  return chunks
}

export function PDFDocument({ assetDirectoryPath, children }) {
  const srcPrefix = import.meta.env.SSR ? assetDirectoryPath : ""
  Font.register({
    family: "BC Sans",
    fonts: [
      {
        src: `${srcPrefix}/fonts/2023_01_01_BCSans-Regular_2f.ttf`,
        fontStyle: "normal",
        fontWeight: 400,
      },
      {
        src: `${srcPrefix}/fonts/2023_01_01_BCSans-Bold_2f.ttf`,
        fontStyle: "normal",
        fontWeight: 700,
      },
      {
        src: `${srcPrefix}/fonts/2023_01_01_BCSans-BoldItalic_2f.ttf`,
        fontStyle: "italic",
        fontWeight: 700,
      },
      {
        src: `${srcPrefix}/fonts/2023_01_01_BCSans-Light_2g.ttf`,
        fontStyle: "normal",
        fontWeight: 300,
      },
      {
        src: `${srcPrefix}/fonts/2023_01_01_BCSans-LightItalic_2f.ttf`,
        fontStyle: "italic",
        fontWeight: 300,
      },
      {
        src: `${srcPrefix}/fonts/2023_01_01_BCSans-Italic_2f.ttf`,
        fontStyle: "italic",
        fontWeight: 400,
      },
    ],
  })

  Font.registerHyphenationCallback((word) => {
    word = word || ""

    // If word contains special characters or is short, don't chunk it
    if (word.includes("@") || word.includes("/") || word.length <= 16) {
      return [word]
    } else {
      // Otherwise, chunk long words
      return chunkSubstr(word, 14)
    }
  })

  return <Document style={{ fontFamily: "BC Sans", color: theme.colors.text.primary }}>{children}</Document>
}

export * from "./atoms"
export * from "./text"
