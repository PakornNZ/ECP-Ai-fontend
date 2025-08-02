'use client'
import Loading from '@/app/components/dashboard/LoadingFull'
import MarkdownRenderer from '@/app/components/MarkdownRenderer'
import { Arlert, DeleteTable, EditChats } from '@/app/components/object/object'
import '@/app/styles/style-Profile-Chat.css'
import { decrypt } from '@/utils/crypto'
import { FormatDateTime } from '@/utils/formatDateTime'
import axios from 'axios'
import { Heart, Settings, Trash2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface MessageProps {
    id: number
    query: string
    answer: string
    rating: number
    chat: number
    user: number
    updatedAt: string
    createdAt: string
}

interface ChatDataProps {
    id: number
    name: string
    count: number
    user: number
    updatedAt: string
    createdAt: string
    messageData: MessageProps[]
}

interface ChatProps {
    id: number
    name: string
    count: number
    user: number
    updatedAt: string
    createdAt: string
}

export default function ProfileChat() {
    const [chatData, setChatData] = useState<ChatDataProps | null>(null)
    const [chat, setChat] = useState<ChatProps | null>(null)
    const [chatId, setChatId] = useState<number | null>(null)

    const msgSectionRef = useRef<HTMLDivElement>(null)
    
    useLayoutEffect(() => {
        if (msgSectionRef.current && chatData?.messageData?.length) {
            msgSectionRef.current.scrollTop = msgSectionRef.current.scrollHeight
        }
    }, [chatData])

    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {
        const decodeURL = async (url: string) => {
            const encodeChatId = decodeURIComponent(url)
            const chat_id = await decrypt(encodeChatId)
            if (!chat_id) return router.push('/dashboard/chats')
            setChatId(Number(chat_id))
        }

        const match = pathname.match(/\/profile\/chat\/(.+)$/)
        if (!match) return router.push('/dashboard/chats')
        decodeURL(match[1])
    }, [pathname, router])
    


    // * ข้อความแจ้งเตือน
    const [arlertMessage, setArlertMessage] = useState({
        color: true,
        message: ""
    })


        const [loading, setLoading] = useState<boolean>(true)
        useEffect(() => {
            if (!chatId) return
            const fetchChat = async () => {
                setLoading(true)
                const payload = {
                    "id": chatId
                }

                try {
                    const res = await axios.post('/api/dashboard/users/profile/chat', payload)
                    const resData = res.data

                    if(resData.status === 1) {
                        setChatData(resData.data)
                        setChat(resData.data)
                        setLoading(false)
                    }
                } catch (error: unknown) {
                    if (!axios.isAxiosError(error)) return
                    const errorMessage = error.response?.data?.message
                    setArlertMessage({
                        color: false,
                        message: errorMessage
                    })
                    const timeOutAPI = setTimeout(() => {
                        setArlertMessage({
                            color: false,
                            message: ""
                        })
                    }, 6000)
                    return () => clearTimeout(timeOutAPI)
                } 
            }
            fetchChat()
        }, [chatId])

        
        
        const [editingRow, setEditingRow] = useState<number | null>(null)
        const [editForm, setEditForm] = useState<Partial<ChatProps>>({})

        const handleRowEdit = (row: ChatProps | null) => {
            if (row === null) {
                setEditingRow(null)
                setEditForm({})
            } else {
                setEditingRow(row.id)
                setEditForm(row)
            }
        }
        
        // * แก้ไขข้อมูล
        const handleSaveEditChat = async (data: Partial<ChatProps>) => {
            if (!data) return
            setEditForm({})

            const payload = {
                id: data.id,
                name: data.name,
                user: data.user
            }

            try {
                const res = await axios.put('/api/dashboard/chats/edit', payload)
                const resData = res.data

                if (resData.status === 1) {
                    setChatData(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            name: payload.name || prev.name
                        }
                    })

                    setChat(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            name: payload.name || prev.name
                        }
                    })

                    setEditingRow(null)
                }
            } catch (error: unknown) {
                if (!axios.isAxiosError(error)) return
                const errorMessage = error.response?.data?.message
                setArlertMessage({
                    color: false,
                    message: errorMessage
                })
                const timeOutAPI = setTimeout(() => {
                    setArlertMessage({
                        color: false,
                        message: ""
                    })
                }, 6000)
                return () => clearTimeout(timeOutAPI)
            }
        }

        // * ลบห้องแชท
        const [deleteData, setDeleteData] = useState<number | null>(null)

        const onSubmitDelete = async (id: number | null) => {
            if (!id) return
            setDeleteData(null)
            
            try {
                const res = await axios.delete('/api/dashboard/messages/delete', { data: id })
                const resData = res.data

                if (resData.status === 1) {
                    setChatData(prev => {
                        if (!prev) return prev
                        return {
                            ...prev,
                            messageData: prev.messageData.filter((row) => row.id !== id)
                        }
                    })
                }
            } catch (error: unknown) {
                if (!axios.isAxiosError(error)) return
                const errorMessage = error.response?.data?.message
                setArlertMessage({
                    color: false,
                    message: errorMessage
                })
                const timeOutAPI = setTimeout(() => {
                    setArlertMessage({
                        color: false,
                        message: ""
                    })
                }, 6000)
                return () => clearTimeout(timeOutAPI)
            }
        }

        const onSubmitDeleteChat = async (id: number | null) => {
            if (!id) return
            setDeleteData(null)
            
            try {
                const res = await axios.delete('/api/dashboard/chats/delete', { data: id })
                const resData = res.data

                if (resData.status === 1) {
                    router.back()
                }
            } catch (error: unknown) {
                if (!axios.isAxiosError(error)) return
                const errorMessage = error.response?.data?.message
                setArlertMessage({
                    color: false,
                    message: errorMessage
                })
                const timeOutAPI = setTimeout(() => {
                    setArlertMessage({
                        color: false,
                        message: ""
                    })
                }, 6000)
                return () => clearTimeout(timeOutAPI)
            }
        }

    
    if (loading) {
        return (
            <>
                <Arlert messageArlert={arlertMessage} />
                <Loading />
            </>
        )
    }
    return (
        <>
            <EditChats
                editingRow={editingRow}
                activeEditingRow={setEditingRow}
                editForm={editForm}
                activeSaveForm={handleSaveEditChat}
                onSubmitDelete={onSubmitDeleteChat}
            />
            <div className="profile-chat-container">
                <div className="profile-chat-bg">
                    <div className="profile-chat-header">
                        <span>#{chatData?.id}</span>
                        <p>{chatData?.name}</p>
                        <div className='profile-chat-delete'>
                            <button type="button" onClick={() => {
                                    handleRowEdit(chat)
                                }}>
                                    <Settings size={16}/>
                            </button>
                        </div>
                    </div>
                    <div className="profile-chat-section" ref={msgSectionRef}>
                        {chatData?.messageData.map((msg, index) => (
                            <div className="profile-message-bubble" key={index}>
                                <div className="profile-query-bubble">
                                    <div className='profile-query-config'>
                                        <div className='profile-query-delete'>
                                            <button 
                                                type="button"
                                                className='query-delete-button'
                                                onClick={() => setDeleteData(msg.id)}>
                                                    <Trash2 size={16}/>
                                            </button>
                                            { deleteData === msg.id && (
                                                <DeleteTable
                                                    id={deleteData}
                                                    onCancel={setDeleteData}
                                                    onSubmit={onSubmitDelete}/>
                                            )}
                                        </div>
                                        <span>{msg.query}</span>
                                    </div>
                                    <div className='profile-query-detail'>
                                        { msg.rating !== 0 &&
                                            <div className='profile-query-rating'>
                                                <Heart size={16}/> {msg.rating} คะแนน
                                            </div>
                                        }
                                        <p style={{ margin: '0', fontSize: '12px', opacity: '0.8' }}>
                                            {FormatDateTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="profile-answer-bubble">
                                    <span><MarkdownRenderer content={msg?.answer || ''} /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </> 
    )
}