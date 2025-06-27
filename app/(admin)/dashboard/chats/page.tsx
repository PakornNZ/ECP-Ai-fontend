'use client'

import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    getFilteredRowModel,
    FilterFn
} from "@tanstack/react-table"
import { ChevronDown, Settings, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Tables from "@/app/components/dashboard/table"
import { Arlert, EditChats } from "@/app/components/object/object"
import { FormatDateTime } from "@/utils/formatDateTime"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Error } from "@/app/components/dashboard/Error"
import Loading from "@/app/components/dashboard/LoadingFull"
import { useOnClickOutside } from "@/app/components/useOnClickOutside"
import { encrypt } from "@/utils/crypto"
import { useRouter } from "next/navigation"

interface ChatProps {
    id: number
    name: string
    count: number
    user: number
    updatedAt: string
    createdAt: string
}

export default function Chats() {
    const router = useRouter()
    const [globalFilter, setGlobalFilter] = useState<string>("")
    const [filterField, setFilterField] = useState<string>("all")
    const [clearFilter, setClearFilter] = useState<boolean>(false)
    const [chatData, setChatData] = useState<ChatProps[]>([])
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'id',
            desc: false
        }
    ])

    // * ข้อความแจ้งเตือน
    const [arlertMessage, setArlertMessage] = useState({
        color: true,
        message: ""
    })

                                    // * แก้ไขข้อมูล
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

                                    const handleSaveEditChat = async (data: Partial<ChatProps>) => {
                                        if (!data) return
                                        setEditingRow(null)
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
                                                data.updatedAt = new Date().toISOString()
                                                
                                                setChatData(prev => 
                                                    prev.map(chat => 
                                                        chat.id === editingRow ? { ...chat, ...data } : chat
                                                    )
                                                )
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
                                            const res = await axios.delete('/api/dashboard/chats/delete', { data: id })
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setChatData((prev) => {
                                                    if (!prev) return prev
                                                    return prev.filter((row) => row.id !== id)
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


                        // * ดึงข้อมูล
                        const fetchChatData = async () => {

                            const res = await axios.get('/api/dashboard/chats')
                            const resData = res.data

                            if(resData.status === 1) {
                                return resData.data
                            }
                            return []
                        }
                        
                        const { data, isLoading, error, refetch } = useQuery({
                            queryKey: ['chats'],
                            queryFn: fetchChatData,
                            staleTime: 5 * 60 * 1000,
                            gcTime: 10 * 60 * 1000,
                            refetchOnWindowFocus: false,
                            refetchOnMount: false,
                            retry: 1,
                        })

                        useEffect(() => {
                            if (data) {
                                setChatData(data)
                            }
                        }, [data])


    const columns: ColumnDef<ChatProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: 'Chat name',
            cell: ({ row }) => 
                    <div className="table-data-container">
                        {row.original.name ? row.original.name : '-'}
                    </div>
        },
        {
            accessorKey: 'count',
            header: 'Message Count',
            enableSorting: true,
        },
        {
            accessorKey: 'user',
            header: 'User ID',
            enableSorting: true,
            cell: ({ row }) =>
                <span>{row.original.user ? row.original.user : '-'}</span>
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated At',
            enableSorting: true,
            cell: ({ row }) => {
                return (
                    <span style={{ opacity: '0.8' }}>{FormatDateTime(row.original.updatedAt)}</span>
                )
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            enableSorting: true,
            cell: ({ row }) => {
                return (
                    <span style={{ opacity: '0.8' }}>{FormatDateTime(row.original.createdAt)}</span>
                )
            }
        },
        {
            accessorKey: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <div className="action-section">
                    <button type="button" onClick={(e) => {
                            handleRowEdit(row.original)
                            e.stopPropagation()
                        }}>
                            <Settings />
                    </button>
                </div>
            )
        }
    ]


    const [openDropdown, setOpenDropdown] = useState<boolean>(false)
    const customGlobalFilter: FilterFn<ChatProps> = (row, columnId, filterValue) => {
        const search = filterValue.toLowerCase()

        switch (filterField) {
            case "id":
                return row.original.id?.toString().toLowerCase().includes(search)
            case "name":
                return row.original.name?.toLowerCase().includes(search)
            case "user":
                return row.original.user?.toString().toLowerCase().includes(search)
            default:
                return (
                    row.original.id?.toString().toLowerCase().includes(search) ||
                    row.original.name?.toLowerCase().includes(search) ||
                    row.original.user?.toString().toLowerCase().includes(search)
                )
        }
    }

    const filterSearch = [
        {filter: "ทั้งหมด", value: "all"},
        {filter: "ID", value: "id"},
        {filter: "Chat name", value: "name"},
        {filter: "User ID", value: "user"},
    ]

    const formatFilter = (filter: string) => {
        switch(filter) {
            case("all"):
                return "ทั้งหมด"
            case("id"):
                return "ID"
            case("name"):
                return "Chat name"
            case("user"):
                return "User ID"
            default:
                return ""
        }
    }

    const dropdownRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(dropdownRef, () => {
        setOpenDropdown(false)
    })

    const tableInfo = useReactTable({
        data: chatData,
        columns,
        state: {
            sorting,
            globalFilter
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableSortingRemoval: false,
        sortDescFirst: false,
        globalFilterFn: customGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 11
            }
        }
    })

    const handleSeachUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim()
        setGlobalFilter(value)
        setClearFilter(value !== "")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }


    // * ขนาดหน้าจอ responsesive
    const [isCompact, setIsCompact] = useState(false)

    // *active Row
    const handleActiveRow = async (row: ChatProps | null) => {
        if (!row) return
            
        const encodeChatId = encodeURIComponent(await encrypt(row.id))
        router.push(`/dashboard/profile/chat/${encodeChatId}`)
    }


        const [activeLoading, setActiveLoading] = useState<boolean>(false)
        useEffect(() => {
            if (activeLoading) {
                refetch()
                const timeOut = setTimeout(() => {
                    setActiveLoading(false)
                }, 1000)
    
                return () => clearTimeout(timeOut)
            }
        }, [activeLoading, refetch])
    
                            if (isLoading) {
                                return <Loading />
                            }
    
                            if (error) {
                                return <Error />
                            }


    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <EditChats
                editingRow={editingRow}
                activeEditingRow={setEditingRow}
                editForm={editForm}
                activeSaveForm={handleSaveEditChat}
                onSubmitDelete={submitDeleteData}
            />
            <div className={`data-container ${isCompact ? 'table-layout' : ''}`}>
                <div className="table-header">
                    <div className="table-search">
                        <div className="table-search-filter" ref={dropdownRef}>
                            <button 
                                type="button"
                                className="search-filter-header"
                                onClick={() => setOpenDropdown(prev => !prev)}>
                                    {formatFilter(filterField)}
                                    <ChevronDown
                                        size={16}
                                        style={{ 
                                            fill: "var(--color-main)",
                                            color: "var(--color-main)",
                                            transform: openDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease'
                                        }} 
                                    />
                            </button>

                            { openDropdown && (
                                <div className="search-filter-select">
                                    {filterSearch.map((data, index) => (
                                        <button 
                                            type="button"
                                            key={index}
                                            className={`${filterField === data.value ? 'button-focus' : ''}`}
                                            onClick={() => {
                                                setFilterField(data.value)
                                                setOpenDropdown(prev => !prev)
                                            }}>
                                            {data.filter}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <hr/>
                        <input type="text" 
                            value={globalFilter}
                            placeholder="ค้นหาข้อมูล"
                            onChange={handleSeachUsers}
                            onKeyDown={handleKeyDown}/>
                        { clearFilter && (
                            <button type="button"
                                className="clear-search"
                                onClick={() => {
                                    setGlobalFilter("") 
                                    setClearFilter(false)
                                }}>
                                    <X />
                            </button>
                        )}
                    </div>
                </div>
                { activeLoading ? (
                    <Loading />
                ) : (
                    <Tables
                        tableInfo={tableInfo}
                        handleRowEdit={handleRowEdit}
                        tableCount={tableInfo.getPrePaginationRowModel().rows.length}
                        onActiveRow={handleActiveRow}
                        isRefetch={setActiveLoading}
                        setIsCompact={setIsCompact}
                    />
                )}
            </div>
        </>
    )
}