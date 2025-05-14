'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import yaml from 'js-yaml'
import Form from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'

const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.default),
    { ssr: false }
)

export default function YamlEditorPage() {
    const initialYAML = `title: "My Parallax LP"
sections:
  - type: hero
    bg_image: "images/hero.jpg"
    headline: "Welcome"
`

    const [yamlText, setYamlText] = useState(initialYAML)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        try {
            const doc = yaml.load(yamlText) as any
            setFormData(doc)
        } catch {
            // ignore parse errors
        }
    }, [yamlText])

    function onFormChange({ formData }: { formData: any }) {
        try {
            const newYaml = yaml.dump(formData, { noRefs: true })
            setYamlText(newYaml)
        } catch {
            // ignore
        }
    }

    const schema: JSONSchema7 = {
        type: 'object',
        required: ['title', 'sections'],
        properties: {
            title: { type: 'string', title: 'ページタイトル' },
            sections: {
                type: 'array',
                title: 'セクション一覧',
                items: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['hero', 'feature', 'parallax', 'footer'],
                            title: 'セクションタイプ'
                        },
                        bg_image: { type: 'string', title: '背景画像 URL' },
                        headline: { type: 'string', title: '見出しテキスト' },
                        subtext: { type: 'string', title: 'サブテキスト' },
                        bg_color: { type: 'string', title: '背景色' },
                        items: {
                            type: 'array',
                            title: '機能リスト',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string', title: '機能名' },
                                    text: { type: 'string', title: '説明文' }
                                }
                            }
                        },
                        strength: { type: 'number', title: 'パララックス強度', minimum: 0, maximum: 1 }
                    }
                }
            }
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, borderRight: '1px solid #ddd' }}>
                <MonacoEditor
                    language="yaml"
                    value={yamlText}
                    onChange={(value) => value !== undefined && setYamlText(value)}
                    options={{ automaticLayout: true }}
                />
            </div>
            <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
                <Form schema={schema} formData={formData} onChange={onFormChange}>
                    <button type="submit" style={{ display: 'none' }} />
                </Form>
                <button
                    onClick={() => {
                        const blob = new Blob([yamlText], { type: 'text/yaml' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'site.yaml'
                        a.click()
                        URL.revokeObjectURL(url)
                    }}
                    style={{
                        marginTop: 20,
                        padding: '8px 16px',
                        background: '#0b69ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4
                    }}
                >
                    Export YAML
                </button>
            </div>
        </div>
    )
}
