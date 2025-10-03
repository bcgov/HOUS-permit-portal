import { SingleZoneCoolingHeatingPDFContent } from "../../domains/single-zone-cooling-heating-tool/pdf-content"

interface PDFComponentProps {
  data: any
  assetDirectoryPath: string
}

type PDFComponentType = React.ComponentType<PDFComponentProps>

export const PDFComponentRegistry: Record<string, PDFComponentType> = {
  single_zone_cooling_heating_tool: SingleZoneCoolingHeatingPDFContent,
}
