import { Link, ListBullets, ListNumbers, TextB, TextItalic, TextUnderline } from "@phosphor-icons/react"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { isQuillEmpty } from "../../../utils/utility-functions"
import { CustomImage } from "./extensions/custom-image"
import { CustomLink } from "./extensions/custom-link"

// from https://stackoverflow.com/questions/11300906/check-if-a-string-starts-with-http-using-javascript
export const getValidUrl = (url = "") => {
  let newUrl = window.decodeURIComponent(url)
  newUrl = newUrl?.trim()?.replace(/\s/g, "")

  if (/^(:\/\/)/.test(newUrl)) {
    return `https${newUrl}`
  }
  if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
    return `https://${newUrl}`
  }

  return newUrl
}

type TToolbarItemName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "header"
  | "blockquote"
  | "code-block"
  | "link"
  | "image"
  | "list"
  | { list: "bullet" }
  | { list: "ordered" }

export interface IEditorProps {
  richText?: boolean
  readonly?: boolean
  placeholder?: string
  onChange?: (htmlValue: string) => void
  htmlValue?: string
  autoFocus?: boolean
  shouldContainRichTextToolbarItem?: (item: TToolbarItemName | string | { [key: string]: any }) => boolean
}

export const Editor = observer(
  ({
    richText = true,
    readonly,
    placeholder,
    onChange,
    htmlValue = "",
    autoFocus = false,
    shouldContainRichTextToolbarItem = () => true,
  }: IEditorProps) => {
    const debouncedHandleChange = useMemo(
      () =>
        debounce((html: string) => {
          onChange?.(isQuillEmpty(html) ? "" : html)
        }, 500),
      [onChange]
    )

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Disable underline from StarterKit since we use separate extension
          underline: false,
        }),
        Underline,
        Placeholder.configure({
          placeholder: placeholder || "",
        }),
        CustomLink.configure({
          openOnClick: false,
        }),
        CustomImage,
      ],
      content: htmlValue,
      editable: !readonly,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        debouncedHandleChange(html)
      },
      editorProps: {
        attributes: {
          class: readonly ? "tiptap-editor-readonly" : "tiptap-editor",
        },
      },
    })

    // Update content when htmlValue prop changes externally
    useEffect(() => {
      if (editor && htmlValue !== editor.getHTML()) {
        editor.commands.setContent(htmlValue)
      }
    }, [htmlValue, editor])

    // Handle autoFocus
    useEffect(() => {
      if (autoFocus && editor && !readonly) {
        editor.commands.focus()
      }
    }, [autoFocus, editor, readonly])

    // Handle readonly changes
    useEffect(() => {
      if (editor) {
        editor.setEditable(!readonly)
      }
    }, [readonly, editor])

    if (!editor) {
      return null
    }

    const handleLinkClick = React.useCallback(() => {
      if (!editor) return
      const url = window.prompt("Enter the URL of the link:")
      if (url) {
        const validUrl = getValidUrl(url)
        const { from, to } = editor.state.selection
        if (from === to) {
          // No selection, insert link
          editor
            .chain()
            .focus()
            .insertContent(`<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`)
            .run()
        } else {
          // Selection exists, wrap in link
          editor.chain().focus().setLink({ href: validUrl }).run()
        }
      } else {
        // Remove link
        editor.chain().focus().unsetLink().run()
      }
    }, [editor])

    const toolbarItems: Array<{
      name: TToolbarItemName | string
      action: () => void
      isActive?: boolean
      icon?: React.ReactNode
    }> = []

    if (richText && !readonly && editor) {
      const availableItems: Array<{
        name: TToolbarItemName | string
        action: () => void
        isActive?: () => boolean
        icon?: React.ReactNode
      }> = [
        {
          name: "bold",
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: () => editor.isActive("bold"),
          icon: <TextB size={16} weight="bold" />,
        },
        {
          name: "italic",
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: () => editor.isActive("italic"),
          icon: <TextItalic size={16} />,
        },
        {
          name: "underline",
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: () => editor.isActive("underline"),
          icon: <TextUnderline size={16} />,
        },
        {
          name: { list: "bullet" },
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: () => editor.isActive("bulletList"),
          icon: <ListBullets size={16} />,
        },
        {
          name: { list: "ordered" },
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: () => editor.isActive("orderedList"),
          icon: <ListNumbers size={16} />,
        },
        {
          name: "link",
          action: handleLinkClick,
          isActive: () => editor.isActive("link"),
          icon: <Link size={16} />,
        },
      ]

      availableItems.forEach((item) => {
        if (shouldContainRichTextToolbarItem(item.name)) {
          const itemName =
            typeof item.name === "string"
              ? item.name
              : (item.name as { list: string }).list === "bullet"
                ? "bulletList"
                : "orderedList"
          toolbarItems.push({
            name: itemName,
            action: item.action,
            isActive: item.isActive?.(),
            icon: item.icon,
          })
        }
      })
    }

    return (
      <div className="tiptap-wrapper">
        {toolbarItems.length > 0 && (
          <div className="tiptap-toolbar">
            {toolbarItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  item.action()
                }}
                className={`tiptap-toolbar-button ${item.isActive ? "is-active" : ""}`}
                aria-label={typeof item.name === "string" ? item.name : "list"}
                title={typeof item.name === "string" ? item.name : "list"}
              >
                {item.icon}
              </button>
            ))}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    )
  }
)
