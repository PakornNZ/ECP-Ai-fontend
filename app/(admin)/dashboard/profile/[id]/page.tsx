'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import "@/app/styles/style-Profiles.css"
import Image from "next/image";
import GoogleLogo from "@/public/logo/google-brands.svg"
import LineLogo from "@/public/logo/line-brands.svg"
import { useEffect, useState } from "react"
import { BadgeAlert, BadgeCheck, BadgeMinus, Check, ChevronLeft, ChevronRight, Inbox, Mail, Pencil, Settings, X } from "lucide-react";
import { FormatDateTime } from "@/utils/formatDateTime";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { decrypt, encrypt } from "@/utils/crypto";
import { Arlert, EditProfile } from "@/app/components/object/object";
import Loading from "@/app/components/dashboard/LoadingFull";

interface ChatProps {
    id: number
    name: string
    count: number
    user: number
    updatedAt: string
    createdAt: string
}

interface UserDataProps {
    id: number
    name: string
    email: string | null
    image: string | null
    role: string | null
    verified: boolean | null
    provider: string | null
    createdAt: string
    chatData: ChatProps[]
}

interface UserProps {
    id: number
    name: string
    email: string
    image: string | null
    role: string
    verified: boolean
    provider: string
    createdAt: string
}

export default function Profiles() {
    const [userData, setUserData] = useState<UserDataProps | null>(null)
    const [user, setUser] = useState<UserProps | null>(null)
    const [userId, setUserId] = useState<number | null>(null)


        const pathname = usePathname()
        const router = useRouter()
        useEffect(() => {
            const decodeURL = async (url: string) => {
                const encodeChatId = decodeURIComponent(url)
                const user_id = await decrypt(encodeChatId)
                if (!user_id) return router.push('/dashboard/users')
                setUserId(Number(user_id))
            }

            const match = pathname.match(/\/profile\/(.+)$/)
            if (!match) return router.push('/dashboard/users')
            decodeURL(match[1])
        }, [pathname, router])
        


        const handleActiveRow = async (id: number) => {
            if (!id) return
    
            const encodeChatId = encodeURIComponent(await encrypt(id))
            router.push(`/dashboard/profile/chat/${encodeChatId}`)
        }


            // * ข้อความแจ้งเตือน
            const [arlertMessage, setArlertMessage] = useState({
                color: true,
                message: ""
            })


                                    // * แก้ไขข้อมูลผู้ใช้งาน
                                    const [editingRow, setEditingRow] = useState<number | null>(null)
                                    const [editForm, setEditForm] = useState<Partial<UserProps>>({})

                                    const handleRowEdit = (row: UserProps | null) => {
                                        if (row === null) {
                                            setEditingRow(null)
                                            setEditForm({})
                                        } else {
                                            setEditingRow(row.id)
                                            setEditForm(row)
                                        }
                                    }

                                    const handleSaveEditUser = async (data: Partial<UserProps>) => {
                                        if (!data) return
                                        setEditingRow(null)
                                        setEditForm({})
                                        const roleFormat = data.role ? (data.role === "user" ? 1 : 2) : null
                                        const payload = {
                                            "id": data.id,
                                            "name": data.name ? data.name : null,
                                            "email": data.email ? data.email : null,
                                            "provider": data.provider ? data.provider : null,
                                            "role": roleFormat,
                                            "verified": data.verified ? data.verified : null
                                        }

                                        try {
                                            const res = await axios.put('/api/dashboard/users/edit', payload)
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setUser(prev => prev ? { ...prev, ...data } : prev)
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

                                    // * ลบข้อมูล
                                    const submitDeleteData = async (id: number | null) => {
                                        if (!id) return
                                        setEditingRow(null)
                                        
                                        try {
                                            const res = await axios.delete('/api/dashboard/users/delete', { data: id })
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                router.push('/dashboard/users')
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
                                

        const [loading, setLoading] = useState<boolean>(true)
        useEffect(() => {
            if (!userId) return
            const fetchUser = async () => {
                setLoading(true)
                const payload = {
                    "id": userId
                }

                try {
                    const res = await axios.post('/api/dashboard/users/profile', payload)
                    const resData = res.data

                    if(resData.status === 1) {
                        setUserData(resData.data)
                        setUser(resData.data)
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

            fetchUser()
        }, [userId])


    const formatDate = (dateString: string) => {
        if (dateString == "") return
        const formated = new Date(dateString).toLocaleDateString()
        return formated
    }


                    // * edit name chatroom
                    const [activeEdit, setActiveEdit] = useState<number | null>(null)
                    const [topicEdit, setTopicEdit] = useState<string | null>(null)

                    const submitEditTopic = async () => {
                        if (topicEdit === null || activeEdit === null) return
                        const payload = {
                            id: activeEdit,
                            name: topicEdit,
                            user: userData?.id
                        }
                        setActiveEdit(null)
                        setTopicEdit(null)

                        try {
                            const res = await axios.put('/api/dashboard/chats/edit', payload)
                            const resData = res.data

                            if (resData.status === 1) {
                                setUserData(prev => {
                                    if (!prev) return prev
                                    return {
                                        ...prev,
                                        chatData: prev.chatData?.map(chat => 
                                            chat.id === activeEdit ? { ...chat, name: payload.name, updatedAt: new Date().toISOString() } : chat
                                        )
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


        const data = userData?.chatData ?? []
        const columns: ColumnDef<ChatProps>[] = [
            {
                accessorKey: 'id',
                cell: ({ row }) => (
                    <div className="chatroom">
                        <span className="chatroom-id">#{row.original.id}</span>
                        <div className="chatroom-data">
                            <div className="chatroom-detail">
                                { activeEdit === row.original.id ? (
                                    <div className="chatroom-edit">
                                        <input 
                                            type="text"
                                            value={topicEdit || ''}
                                            onChange={(e) => setTopicEdit(e.target.value)}
                                            autoFocus
                                            />
                                        <button type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setActiveEdit(null)
                                                setTopicEdit(null)
                                            }}>
                                                <X />
                                        </button>
                                        <button type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                submitEditTopic()
                                            }}>
                                            <Check
                                                style={{ color: "var(--color-main)"}}/>
                                        </button>
                                    </div>
                                ) : 
                                    <h1 onClick={(e) => {
                                        setActiveEdit(row.original.id)
                                        setTopicEdit(row.original.name)
                                        e.stopPropagation()
                                    }}>
                                        {row.original.name}
                                    </h1>
                                }
                                <p>{row.original.count} คำถาม</p>
                            </div>
                            <div className="chatroom-date">
                                <span>อัปเดตเมื่อ {FormatDateTime(row.original.updatedAt)}</span>
                                <span>สร้างเมื่อ {FormatDateTime(row.original.createdAt)}</span>
                            </div>
                            { !activeEdit && (
                                <button 
                                    type="button" 
                                    className="edit-chatroom-name"
                                    onClick={(e) => {
                                        setActiveEdit(row.original.id)
                                        setTopicEdit(row.original.name)
                                        e.stopPropagation()
                                    }}>
                                        <Pencil size={15}/>
                                </button>
                            )}
                        </div>
                    </div>
                )
            }
        ]

        const tableInfo = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            initialState: {
                pagination: {
                    pageSize: 7
                }
            }
        })
    

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
            <Arlert messageArlert={arlertMessage} />
            <EditProfile
                editingRow={editingRow}
                activeEditingRow={setEditingRow}
                editForm={editForm}
                activeSaveForm={handleSaveEditUser}
                onSubmitDelete={submitDeleteData}
            />
            <div className="profiles-container" >
                <div className="profiles-section">
                    <div className="profiles-detail">
                        <div className="profile-setting-button">
                            <button 
                                type="button"
                                onClick={() => handleRowEdit(user)}>
                                    <Settings size={16}/>
                            </button>
                        </div>
                        <div className="profiles-bg">
                            <Image src={ user?.image ? user?.image : "/profile/profile-user.png" } 
                                alt="profile-img" className="profiles-img" width={60} height={60}/>
                            <div className="profiles-name-section">
                                <div className="profiles-verified">
                                    <h1 className="profiles-id">#{user?.id}</h1>
                                    {user?.verified !== null ? (
                                        user?.verified ? (
                                            <BadgeCheck fill="#7bc549"/>
                                        ) :(
                                            <BadgeAlert fill="#df4e4e"/>
                                        )
                                    ) : (
                                        <BadgeMinus fill="#aaa"/>
                                    )}
                                    <span></span>
                                </div>
                                <h1 className="profiles-name">{user?.name}</h1>
                            </div>
                            <div className="profiles-detail-section">
                                { user?.email ? (
                                    <p className="profiles-email">{user?.email || "ไม่มีอีเมล"}</p>
                                ) : (
                                    <p className="profiles-email" style={{ opacity: '0.8', fontSize: '12px' }}>ไม่มีอีเมล</p>
                                )}
                                <span className="profiles-role">Role: {user?.role ? (user?.role === "user" ? "User" : "Admin") : "-"}</span>
                                <div className="profiles-provider">
                                    { user?.provider == "credentials" && (
                                        <Mail />
                                    )}
                                    { user?.provider == "google" && (
                                        <Image src={GoogleLogo} alt="google-logo" width={16} height={16}/>
                                    )}
                                    { user?.provider == "line" && (
                                        <Image src={LineLogo} alt="line-logo" width={16} height={16}/>
                                    )}
                                    <p className="profiles-createdAt">ลงทะเบียน {formatDate(user?.createdAt || "")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="chatroom-bg">
                        <p className="profiles-count"><Inbox />{userData?.chatData?.length} ห้องสนทนา</p>
                        <div className="chatroom-object">
                            <div className="chatroom-station">
                                <table>
                                    <tbody>
                                        {tableInfo.getRowModel().rows.length > 0 ? (
                                            tableInfo.getRowModel().rows.map(row => (
                                                <tr key={row.id} onClick={() => handleActiveRow(row.original.id)}>
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={tableInfo.getAllLeafColumns().length} className="table-no-data">
                                                    ไม่พบข้อมูล
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="page-section">
                                <div style={{ justifyContent: "end" }}>
                                    { tableInfo.getCanPreviousPage() && 
                                        <button 
                                            type="button"
                                            className="skip-page"
                                            onClick={() => {
                                                tableInfo.previousPage()
                                                handleRowEdit?.(null)
                                            }}>
                                                <ChevronLeft />
                                        </button>
                                    }
                                </div>
                                <div style={{ gap: "10px" }}>
                                    <span>{tableInfo.getState().pagination.pageIndex + 1}</span>
                                    <span>จาก</span>
                                    <span>{tableInfo.getPageCount()}</span>
                                </div>
                                <div style={{ justifyContent: "start" }}>
                                    { tableInfo.getCanNextPage() && 
                                        <button 
                                            type="button"
                                            className="skip-page"
                                            onClick={() => {
                                                tableInfo.nextPage()
                                                handleRowEdit?.(null)
                                            }}>
                                                <ChevronRight />
                                        </button>
                                    }
                                    <div className="fix-page">
                                        <span>หน้า</span>
                                        <input
                                            type="text" 
                                            placeholder="ระบุหน้า"
                                            min={1} 
                                            max={tableInfo.getPageCount()} 
                                            onChange={(e) => {
                                                const page = Number(e.target.value) - 1
                                                if (!isNaN(page) && page >= 0 && page < tableInfo.getPageCount()) {
                                                    tableInfo.setPageIndex(page)
                                                    handleRowEdit?.(null)
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}