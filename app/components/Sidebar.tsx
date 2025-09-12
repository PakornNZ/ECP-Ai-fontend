"use client"

import { PanelLeftClose, SquarePlus, Ellipsis, CircleX, Pencil, Trash, ShieldUser } from 'lucide-react';
import "@/app/styles/style-Silebar.css";
import EditHistory from "@/app/components/popup/Edit-History-Popup";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Arlert } from "@/app/components/object/object"
import axios from 'axios';
import HistoryGroup from '@/app/components/object/History';
import { useSession } from 'next-auth/react';
import { encrypt } from "@/utils/crypto"

interface SidebarProps {
    isState: boolean,
    closeSidebar: () => void
    ChatIdSelect: (chat_id: number) => void
    chatId: number | null
    newTopic: ChatHistoryProps | null
}

interface ChatHistoryProps {
    id: number
    chat_history: string
    date: Date
}

export default function Sidebar({ isState, closeSidebar, ChatIdSelect, chatId, newTopic }: SidebarProps) {
    // *เปิด-ปิด EDIT ประวัติการสนทนา
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const [activeEdit, setActiveEdit] = useState<number | null>(null)
    const togglePopup = (historyId: number, event: React.MouseEvent) => {
        event.stopPropagation()
        setActiveEdit((prev) => (prev === historyId ? null : historyId))
    }
    const closePopup = () => {
        setActiveEdit(null)
    }


    const router = useRouter()
    const hadleHome = () => {
        router.push("/")
    }

    // * ข้อความแจ้งเตือน
    const [arlertMessage, setArlertMessage] = useState({
        color: true,
        message: ""
    })

    const [loadingHistory, setLoadingHistory] = useState<boolean>(true)
    const [activeChatId, setActiveChatId] = useState<number | null>(null)
    
    const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([])
    
    const { data: session } = useSession()
    useEffect(() => {
        if (typeof session === "undefined" || !session) return

        GetHistory()
    }, [session])
    
                                const GetHistory = async () => {
                                    try {
                                        const res = await axios.get('/api/data/history_chat')
                                        const resData = res.data

                                        if (resData.status === 1){
                                            setChatHistory(resData.data)
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


        const { today, last7Days, last30Days, older, loading } = HistoryGroup(Array.isArray(chatHistory) ? chatHistory : [])
            
            useEffect(() => {
                if (!newTopic) return
                setChatHistory((prev) => {
                    if (!Array.isArray(prev) || !newTopic) return [newTopic]
                    const existsIndex = prev.findIndex((item) => item.id === newTopic.id)
                    if (existsIndex === -1) {
                        return [newTopic, ...prev]
                    } else {
                        const updated = [...prev]
                        updated[existsIndex] = { ...prev[existsIndex], ...newTopic }
                        return updated
                    }
                })
            }, [newTopic])

            useEffect(() => {
                setLoadingHistory(loading)
            }, [loading])


        const [isMsgId, setIsMsgId] = useState<number | null>(null)
        const updateHistoryTopic = (msg_id: number, message: string) => {
            setIsMsgId(msg_id)
            setMsgTopic(message)
        }
        const updateTopic = (chat_id: number, newTopic: string) => {
            setChatHistory((prev) => {
                if (!prev) return prev
                return prev.map((item) =>
                    item.id === chat_id ? { ...item, chat_history: newTopic } : item
                )
            })
        }
        const closeEditTopic = () => {
            setIsMsgId(null)
            setMsgTopic("")
        }

        const [msgTopic, setMsgTopic] = useState<string>("")
        const submitTopic = async () => {
            if (!isMsgId || msgTopic == "") return closeEditTopic()

            const payload = {
                "chat_id": isMsgId,
                "chat_name": msgTopic
            }

            closeEditTopic()
            updateTopic(payload.chat_id, payload.chat_name)
            try {
                await axios.put('/api/data/chat_name', payload)
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

        


            useEffect(() => {
                setActiveChatId(chatId)
            }, [chatId])

            const EnterChat = async (chat_id: number) => {
                if (chat_id == chatId) return
                const encodeChatId = encodeURIComponent(await encrypt(chat_id))
                window.history.pushState({}, '', `/chats/${encodeChatId}`)
                ChatIdSelect(chat_id)
            }



            // * Delete chat
            const [isDelete, setIsDelete] = useState<number | null>(null)
            const handleDelete = (msg_id: number) => {
                setIsDelete(msg_id)
            }


            const submitDelete = async (chat_id: number) => {
                if (!chat_id) return
                try {
                    await axios.put('/api/data/chat_delete', { chat_id })
                    setChatHistory((prev) => prev.filter((item) => item.id !== chat_id))
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
                } finally {
                    setIsDelete(null)
                    if (chat_id === activeChatId) router.push("/")
                }
            }

    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <div className={`sidebar-bg ${isState ? "sidebar-open" : ""}`}>
                <div className="sidebar-bg-1">
                    <div className="sidebar-close">
                        <button left-title="ปิด Sidebar" type="button" onClick={closeSidebar}>
                            <PanelLeftClose />
                        </button>
                    </div>
                    <div className="sidebar-search">
                        <button left-title="สร้างการสนทนา" type="button" onClick={hadleHome}>
                            <SquarePlus/>
                        </button>
                    </div>
                </div>
                { !loadingHistory ? (
                    <>
                        <div className="history-chat">
                            { today.length > 0 && (
                                <>
                                    <h2>วันนี้</h2>
                                    <div className="history-section">
                                        {today?.map((e) => (
                                            <div 
                                                className={`history-topic ${activeChatId === e.id ? 'active' : ''}`}
                                                key={e.id}
                                                onClick={() => !isMsgId && !isDelete && (EnterChat(e.id))}>
                                                    { isMsgId === e.id || isDelete === e.id ? (
                                                        <>
                                                            { isMsgId === e.id && (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={40}
                                                                        autoFocus
                                                                        value={msgTopic}
                                                                        onChange={(event) => setMsgTopic(event.target.value)}/>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={submitTopic}>
                                                                                <Pencil />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={closeEditTopic}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                            { isDelete === e.id && (
                                                                <>
                                                                    <p>{e.chat_history}</p>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        style={{ color: "var(--color-alert)"}}
                                                                        onClick={() => submitDelete(e.id)}>
                                                                            <Trash />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={() => setIsDelete(null)}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p>{e.chat_history}</p>
                                                            <button ref={buttonRef}
                                                                type="button" 
                                                                right-title="จัดการ" 
                                                                onClick={(event) => togglePopup(e.id, event)}
                                                                className="sidebar-button">
                                                                <Ellipsis className="topic-menu" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeEdit === e.id && (
                                                        <EditHistory
                                                            msg_id={e.id}
                                                            message={e.chat_history}
                                                            onClose={closePopup}
                                                            updateTopic={updateHistoryTopic}
                                                            setIsDelete={handleDelete}
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            { last7Days.length > 0 && (
                                <>
                                    <h2>อาทิตย์นี้</h2>
                                    <div className="history-section">
                                        {last7Days?.map((e) => (
                                            <div 
                                                className={`history-topic ${activeChatId === e.id ? 'active' : ''}`}
                                                key={e.id}
                                                onClick={() => !isMsgId && !isDelete && (EnterChat(e.id))}>
                                                    { isMsgId === e.id || isDelete === e.id ? (
                                                        <>
                                                            { isMsgId === e.id && (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={40}
                                                                        autoFocus
                                                                        value={msgTopic}
                                                                        onChange={(event) => setMsgTopic(event.target.value)}/>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={submitTopic}>
                                                                                <Pencil />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={closeEditTopic}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                            { isDelete === e.id && (
                                                                <>
                                                                    <p>{e.chat_history}</p>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        style={{ color: "var(--color-alert)"}}
                                                                        onClick={() => submitDelete(e.id)}>
                                                                            <Trash />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={() => setIsDelete(null)}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p>{e.chat_history}</p>
                                                            <button ref={buttonRef}
                                                                type="button" 
                                                                right-title="จัดการ" 
                                                                onClick={(event) => togglePopup(e.id, event)}
                                                                className="sidebar-button">
                                                                <Ellipsis className="topic-menu" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeEdit === e.id && (
                                                        <EditHistory
                                                            msg_id={e.id}
                                                            message={e.chat_history}
                                                            onClose={closePopup}
                                                            updateTopic={updateHistoryTopic}
                                                            setIsDelete={handleDelete}
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            { last30Days.length > 0 && (
                                <>
                                    <h2>เดือนนี้</h2>
                                    <div className="history-section">
                                        {last30Days?.map((e) => (
                                            <div 
                                                className={`history-topic ${activeChatId === e.id ? 'active' : ''}`} 
                                                key={e.id}
                                                onClick={() => !isMsgId && !isDelete && (EnterChat(e.id))}>
                                                    { isMsgId === e.id || isDelete === e.id ? (
                                                        <>
                                                            { isMsgId === e.id && (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={40}
                                                                        autoFocus
                                                                        value={msgTopic}
                                                                        onChange={(event) => setMsgTopic(event.target.value)}/>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={submitTopic}>
                                                                                <Pencil />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={closeEditTopic}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                            { isDelete === e.id && (
                                                                <>
                                                                    <p>{e.chat_history}</p>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        style={{ color: "var(--color-alert)"}}
                                                                        onClick={() => submitDelete(e.id)}>
                                                                            <Trash />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={() => setIsDelete(null)}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p>{e.chat_history}</p>
                                                            <button ref={buttonRef}
                                                                type="button" 
                                                                right-title="จัดการ" 
                                                                onClick={(event) => togglePopup(e.id, event)}
                                                                className="sidebar-button">
                                                                <Ellipsis className="topic-menu" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeEdit === e.id && (
                                                        <EditHistory
                                                            msg_id={e.id}
                                                            message={e.chat_history}
                                                            onClose={closePopup}
                                                            updateTopic={updateHistoryTopic}
                                                            setIsDelete={handleDelete}
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            { older.length > 0 && (
                                <>
                                    <h2>หลายเดือนที่ผ่านมา</h2>
                                    <div className="history-section">
                                        {older?.map((e) => (
                                            <div 
                                                className={`history-topic ${activeChatId === e.id ? 'active' : ''}`}
                                                key={e.id}
                                                onClick={() => !isMsgId && !isDelete && (EnterChat(e.id))}>
                                                    { isMsgId === e.id || isDelete === e.id ? (
                                                        <>
                                                            { isMsgId === e.id && (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={40}
                                                                        autoFocus
                                                                        value={msgTopic}
                                                                        onChange={(event) => setMsgTopic(event.target.value)}/>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={submitTopic}>
                                                                                <Pencil />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={closeEditTopic}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                            { isDelete === e.id && (
                                                                <>
                                                                    <p>{e.chat_history}</p>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        style={{ color: "var(--color-alert)"}}
                                                                        onClick={() => submitDelete(e.id)}>
                                                                            <Trash />
                                                                    </button>
                                                                    <button
                                                                        type="button" 
                                                                        className="edit-button"
                                                                        onClick={() => setIsDelete(null)}>
                                                                            <CircleX/>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p>{e.chat_history}</p>
                                                            <button ref={buttonRef}
                                                                type="button" 
                                                                right-title="จัดการ" 
                                                                onClick={(event) => togglePopup(e.id, event)}
                                                                className="sidebar-button">
                                                                <Ellipsis className="topic-menu" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeEdit === e.id && (
                                                        <EditHistory
                                                            msg_id={e.id}
                                                            message={e.chat_history}
                                                            onClose={closePopup}
                                                            updateTopic={updateHistoryTopic}
                                                            setIsDelete={handleDelete}
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="history-chat" style={{ gap: "10px", display: "flex", flexDirection: "column"}}>
                            <div className="skeleton" style={{ height: "18px", width: "50%"}} />
                            <div className="skeleton" style={{ height: "13px", width: "90%"}} />
                            <div className="skeleton" style={{ height: "13px", width: "80%"}} />
                            <div className="skeleton" style={{ height: "13px", width: "100%"}} />
                        </div>
                    </>
                )}
                { session?.user.role == 2 && (
                    <div className="dashboard">
                        <button 
                            type="button"
                            onClick={() => router.push('/dashboard')}>
                                <ShieldUser />Dashboard
                        </button>
                    </div>
                    )}
            </div>
        </>
    )
}   