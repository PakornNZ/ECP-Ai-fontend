'use client'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import "@/app/styles/style-Response.css"
import rehypeHighlight from 'rehype-highlight'
import { Arlert } from "@/app/components/object/object"
import { Copy, Check } from 'lucide-react'
import { useEffect, useState, Children, isValidElement, ReactNode, ReactElement } from 'react'
import React from 'react'

export default function MarkdownRenderer({ content }: { content: string }) {

    const CodeBlock: Components['pre'] = ({ children, ...props }) => {
        let language = 'text'
        if (children && isValidElement(children)) {
            const codeElement = children as ReactElement<{ className?: string }>
            if (codeElement.props?.className) {
                language = codeElement.props.className.replace(/^language-/, '').replace(/^hljs /, '') || 'text'
            }
        }
        const [copied, setCopied] = useState<boolean>(false)
        const [playAnimation, setPlayAnimation] = useState<boolean>(false)

        const handleCopy = async () => {
            try {
                const text = extractTextFromChildren(children).trim()
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text)
                } else {
                    const textArea = document.createElement("textarea")
                    textArea.value = text
                    document.body.appendChild(textArea)
                    textArea.focus()
                    textArea.select()

                    try {
                        document.execCommand('copy')
                    } catch (error) {
                        console.error("Failed to copy: ", error)
                    }
                    document.body.removeChild(textArea)
                }
                setPlayAnimation(true)
                setCopied(true)
                setArlertMessage({
                    color: true,
                    message: "คัดลอกข้อความสำเร็จ"
                })

                const timeout = setTimeout(() => {
                    setCopied(false)
                    setPlayAnimation(true)
                    setArlertMessage({
                        color: true,
                        message: ""
                    })
                }, 6000)
                return () => clearTimeout(timeout)
            } catch (error) {
                console.error("Failed to copy: ", error)
            }
        }

        const [arlertMessage, setArlertMessage] = useState({
            color: true,
            message: ""
        })

        useEffect(() => {
                if (!playAnimation) return
                const timeout = setTimeout(() => setPlayAnimation(false), 500)
                return () => clearTimeout(timeout)
            }, [playAnimation])
        
        return  <>
                    <Arlert messageArlert={arlertMessage} />
                    <div className="sestioc-bg">
                        <div className="code-header">
                            <span className="lang">{language}</span>
                            <button type="button" className={`copy-code ${playAnimation ? "play" : ""}`}
                                onClick={handleCopy}>
                                {copied ? <Check /> : <Copy />}
                            </button>
                        </div>
                        <pre className="section-pre" {...props}>
                            <code>
                                {children}
                            </code>
                        </pre>
                    </div>
                </>
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
                pre: CodeBlock,
                code({children}) {
                    return <code>{children}</code>
                },
                strong({ children }) {
                    return <strong className="">{children}</strong>
                },
                p({ children }) {
                    return <p className="section-p">{children}</p>
                },
                h3({ children }) {
                    return <h3 className="section-h3">{children}</h3>
                },
                ul({ children }) {
                    return <ul className="section-ul">{children}</ul>
                },
                ol({ children }) {
                    return <ol className="section-ul">{children}</ol>
                },
                table({ children }) {
                    return <table className="section-table">{children}</table>
                },
                a({ href, children }) {
                    return <a className='section-a' href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                }
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

function extractTextFromChildren(children: ReactNode): string {
    let result = ""

    Children.forEach(children, (child) => {
        if (typeof child === "string" || typeof child === "number") {
            result += child
        } else if (isValidElement(child)) {
            const element = child as ReactElement<{ children?: ReactNode}>
            if (element.props.children) {
                result += extractTextFromChildren(element.props.children);
            }
        }
    })

    return result
}