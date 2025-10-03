import { Document, Page, Text, View } from "@react-pdf/renderer"
import React from "react"

interface BasePDFFormProps {
  title: string
  formData: any
  metadata: {
    id: string
    createdAt: string
    status: string
    userId?: string
  }
  assetDirectoryPath: string
  children?: React.ReactNode
}

export const BasePDFForm: React.FC<BasePDFFormProps> = ({ title, formData, metadata, children }) => (
  <Document>
    <Page size="A4" style={{ padding: 30, fontSize: 12 }}>
      <View style={{ padding: 30, fontSize: 12 }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>{title}</Text>
        <Text>Form ID: {metadata.id}</Text>
        <Text>Created: {new Date(metadata.createdAt).toLocaleDateString()}</Text>
        <Text>Status: {metadata.status}</Text>
      </View>
      {children}
    </Page>
  </Document>
)
