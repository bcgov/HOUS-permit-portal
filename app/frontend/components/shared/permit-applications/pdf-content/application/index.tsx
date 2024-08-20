import { Page, Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { theme } from "../../../../../styles/theme"
import { generateUUID } from "../../../../../utils/utility-functions"
import { Footer } from "../shared/footer"
import { page } from "../shared/styles/page"

enum EComponentType {
  checkbox = "checkbox",
  container = "container",
  datagrid = "datagrid",
  date = "date",
  fieldset = "fieldset",
  columns = "columns",
  file = "simplefile",
  number = "number",
  panel = "panel",
  select = "select",
  checklist = "selectboxes",
  email = "simpleemail",
  phone = "simplephonenumber",
  text = "simpletextfield",
  textarea = "textarea",
}

export const ApplicationFields = function ApplicationFields({
  permitApplication,
}: {
  permitApplication: IPermitApplication
}) {
  return (
    <Page size="LETTER" style={page}>
      <View style={{ overflow: "hidden" }}>
        {permitApplication.formattedFormJson.components.map((c) => (
          <FormComponent key={c.id} component={c} permitApplication={permitApplication} />
        ))}
      </View>
      <Footer permitApplication={permitApplication} />
    </Page>
  )
}

interface IFormComponentProps {
  permitApplication: IPermitApplication
  component: any
  dataPath?: string[]
}

const FormComponent = function ApplicationPDFFormComponent({
  permitApplication,
  component,
  dataPath,
}: IFormComponentProps) {
  const extractFields = (component) => {
    if (component.input) {
      const { isVisible } = extractFieldInfo(component)
      return isVisible && component
    } else if (component.components || component.columns) {
      return R.map(extractFields, component.components || [component.columns[0]])
    }
  }

  const fields = (components: any[]) => {
    return R.flatten(R.map(extractFields, components)).filter((outNull) => outNull)
  }

  const extractFieldInfo = (component) => {
    switch (component.type) {
      case EComponentType.checklist: {
        const options = R.path([dataPath, component.key], permitApplication.submissionData.data)
        const label = component.label
        const values: any = Object.keys(options ?? {}).filter((key) => !!options[key])
        return { options, values, label, isVisible: !R.isEmpty(values) && !R.isNil(label) }
      }
      case EComponentType.datagrid: {
        return { value: null, label: null }
      }
      default:
        const label = component.label
        const value = R.path([...dataPath, component.key], permitApplication.submissionData.data)
        return { value, label, isVisible: !R.isNil(value) && !R.isNil(label) }
    }
  }

  switch (component.type) {
    case EComponentType.container: {
      dataPath = [component.key]
      const { components, columns } = component
      const componentFields = fields(components || columns)
      const isValid = !R.isEmpty(component.title.trim()) && componentFields.length > 0
      if (!isValid) return null
      const firstChild: any = R.head(components)
      const additionalChildren: any = R.tail(components)

      return (
        <View>
          <View>
            <ContainerHeader component={component} />
            <FormComponent component={firstChild} dataPath={dataPath} permitApplication={permitApplication} />
          </View>
          {additionalChildren.map((child) => (
            <FormComponent
              key={generateUUID()}
              component={child}
              dataPath={dataPath}
              permitApplication={permitApplication}
            />
          ))}
        </View>
      )
    }
    case EComponentType.panel: {
      return (
        <View
          style={{
            borderColor: theme.colors.border.light,
            marginBottom: 24,
            width: "100%",
          }}
        >
          <PanelHeader component={component} />
          {component.components && (
            <View
              style={{
                gap: 4,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.border.light,
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              {component.components.map((child) => (
                <FormComponent
                  key={generateUUID()}
                  component={child}
                  dataPath={dataPath}
                  permitApplication={permitApplication}
                />
              ))}
            </View>
          )}
        </View>
      )
    }
    case EComponentType.datagrid: {
      const values: any[] = (R.path([...dataPath, component.key], permitApplication.submissionData.data) ?? []) as any[]

      const dataGridChildComponent = component?.components?.[0]

      return (
        <>
          {dataGridChildComponent &&
            Array.isArray(values) &&
            values.map((value, index) => (
              <FormComponent
                key={generateUUID()}
                component={dataGridChildComponent}
                dataPath={[...dataPath, component.key, index]}
                permitApplication={permitApplication}
              />
            ))}
        </>
      )
    }
    case EComponentType.fieldset:
      const numFields = fields(component.components).length

      return (
        numFields > 0 && (
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border.light,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 4,
            }}
          >
            {component.components.map((child) => (
              <FormComponent
                key={generateUUID()}
                component={child}
                dataPath={dataPath}
                permitApplication={permitApplication}
              />
            ))}
          </View>
        )
      )
    case EComponentType.columns:
      return (
        <>
          {component.columns && (
            <View style={{ flexDirection: "row", gap: 20, width: "100%" }}>
              {component.columns.map((column, index) => {
                return column.components
                  .map((child) => {
                    return (
                      <View key={generateUUID()} style={{ flex: 1 }}>
                        <FormComponent
                          key={child.id}
                          component={child}
                          dataPath={dataPath}
                          permitApplication={permitApplication}
                        />
                      </View>
                    )
                  })
                  .flat()
              })}
            </View>
          )}
        </>
      )
    case EComponentType.file: {
      const { value, label, isVisible } = extractFieldInfo(component)

      return isVisible ? <FileField value={value} label={label} /> : null
    }
    case EComponentType.checklist: {
      const { options, values, label, isVisible } = extractFieldInfo(component)
      return isVisible ? <ChecklistField options={options} label={label} /> : null
    }
    case EComponentType.checkbox: {
      const { value, label, isVisible } = extractFieldInfo(component)
      return isVisible ? <CheckboxField value={value} label={label} /> : null
    }
    case EComponentType.select:
    case EComponentType.text:
    case EComponentType.textarea:
    case EComponentType.number:
    case EComponentType.phone:
    case EComponentType.date:
    case EComponentType.email: {
      const { value, label, isVisible } = extractFieldInfo(component)
      return isVisible ? <InputField value={value} label={label} type={component.type} /> : null
    }
    default:
      import.meta.env.DEV && console.log("[DEV]: missing component", component)
      return null
  }
}

const ContainerHeader = function ApplicationPDFContainerHeader({ component }) {
  return (
    <View style={{ marginTop: 32, paddingBottom: 15, gap: 8 }} wrap={false}>
      <View
        style={{
          borderWidth: 3,
          borderColor: theme.colors.theme.yellow,
          width: 27,
          backgroundColor: theme.colors.theme.yellow,
        }}
      />
      <Text style={{ fontSize: 20, fontWeight: 700 }}>{component.title}</Text>
    </View>
  )
}

const PanelHeader = function ApplicationPDFPanelHeader({ component }) {
  return (
    <View
      style={{
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 24,
        paddingRight: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.greys.grey04,
        width: "100%",
      }}
      fixed
    >
      <Text style={{ fontSize: 12, fontWeight: 700 }}>{component.title}</Text>
    </View>
  )
}

const ChecklistField = function ApplicationPDFPanelChecklistField({ options, label }) {
  return (
    <View style={{ gap: 4, paddingTop: 4 }} wrap={false}>
      <Text
        style={{
          fontSize: 12,
          color: theme.colors.text.primary,
          paddingBottom: 4,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <View style={{ gap: 8 }}>
        {Object.keys(options).map((key) => {
          return <Checkbox key={key} isChecked={options[key]} label={key} />
        })}
      </View>
    </View>
  )
}

const CheckboxField = function ApplicationPDFPanelCheckboxField({ value, label }) {
  return (
    <View style={{ gap: 4, paddingTop: 4 }} wrap={false}>
      <Checkbox isChecked={value} label={label} />
    </View>
  )
}

function Checkbox({ isChecked, label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderColor: theme.colors.border.dark,
          borderWidth: isChecked ? 0 : 0.75,
          backgroundColor: isChecked ? theme.colors.text.primary : theme.colors.greys.white,
        }}
      />

      <Text style={{ fontSize: 12, color: theme.colors.text.primary }}>{label}</Text>
    </View>
  )
}

const InputField = function ApplicationPDFInputField({ value, label, type }) {
  return <RequirementField label={label} value={value} />
}

const FileField = function ApplicationPDFFileField({ value, label }: { value: Record<string, any>[]; label: string }) {
  const fileExists = value && !R.isEmpty(value)

  return (
    <RequirementField
      label={label}
      value={fileExists ? R.pluck("originalName", value).join(", ") : t("permitApplication.pdf.fileNotAdded")}
    />
  )
}

function RequirementField({ label, value }) {
  return (
    <View style={{ gap: 4, paddingTop: 4 }} wrap={false}>
      <Label label={label} />
      <Input value={value} />
    </View>
  )
}

function Label({ label }) {
  return (
    <Text style={{ fontSize: 12, color: theme.colors.text.primary, paddingBottom: 4, marginBottom: 4 }}>{label}</Text>
  )
}

function Input({ value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        minHeight: 28,
        borderColor: theme.colors.border.light,
        borderRadius: 4,
        borderWidth: 1,
        paddingTop: 6,
        paddingBottom: 6,
        marginBottom: 6,
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: 12,
      }}
    >
      <Text>{value}</Text>
    </View>
  )
}
