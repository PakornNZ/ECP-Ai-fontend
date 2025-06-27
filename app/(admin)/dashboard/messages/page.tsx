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
import { ChevronDown, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Arlert, CustomDropdown, DeleteTable } from "@/app/components/object/object"
import Tables from "@/app/components/dashboard/table"
import "@/app/styles/style-Messages.css"
import MarkdownRenderer from "@/app/components/MarkdownRenderer"
import { useOnClickOutside } from "@/app/components/useOnClickOutside"
import { FormatDateTime } from "@/utils/formatDateTime"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import Loading from "@/app/components/dashboard/LoadingFull"
import { Error } from "@/app/components/dashboard/Error"

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

export default function Messages() {
    const [globalFilter, setGlobalFilter] = useState<string>("")
    const [filterField, setFilterField] = useState<string>("all")
    const [clearFilter, setClearFilter] = useState<boolean>(false)
    const [msgData, setMsgData] = useState<MessageProps[]>([])
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'id',
            desc: false
        }
    ])

    
    const [isCompact, setIsCompact] = useState(false)

    // * ข้อความแจ้งเตือน
    const [arlertMessage, setArlertMessage] = useState({
        color: true,
        message: ""
    })

                                    // * ลบข้อมูล
                                    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
                                    
                                    const submitDeleteData = async (id: number | null) => {
                                        if (!id) return
                                        setConfirmDelete(null)
                                        
                                        try {
                                            const res = await axios.delete('/api/dashboard/messages/delete', { data: id })
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setActiveRow(null)
                                                setMsgData((prev) => {
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
                        const fetchMsgData = async () => {

                            const res = await axios.get('/api/dashboard/messages')
                            const resData = res.data

                            if(resData.status === 1) {
                                return resData.data
                            }
                            return []

                        }
                        
                        const { data, isLoading, error, refetch } = useQuery({
                            queryKey: ['messages'],
                            queryFn: fetchMsgData,
                            staleTime: 5 * 60 * 1000,
                            gcTime: 10 * 60 * 1000,
                            refetchOnWindowFocus: false,
                            refetchOnMount: false,
                            retry: 1,
                        })

                        useEffect(() => {
                            if (data) {
                                setMsgData(data)
                            }
                        }, [data])




    // * กรองข้อมูล สำหรับค้นหา
    const [filterRating, setFilterRating] = useState<string>("")

    const filteredData = useMemo(() => {
        return msgData.filter(msg => {
            if (filterRating && String(msg.rating) !== filterRating) {
                return false
            }
            
            return true
        })
    }, [msgData, filterRating])

    const columns: ColumnDef<MessageProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
        },
        {
            accessorKey: 'query',
            header: 'Query',
            cell: ({ row }) => 
                <div className="table-data-container">
                    {row.original.query ? row.original.query : '-'}
                </div>
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            enableSorting: true
        },
        {
            accessorKey: 'chat',
            header: 'Chat ID',
            enableSorting: true,
            cell: ({ row }) =>
                <span>{ row.original.chat ? row.original.chat : '-' }</span>
        },
        {
            accessorKey: 'user',
            header: 'User ID',
            enableSorting: true,
            cell: ({ row }) =>
                <span>{ row.original.user ? row.original.user : '-' }</span>
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
            enableSorting: false
        }
    ]



    const [openDropdown, setOpenDropdown] = useState<boolean>(false)
    const customGlobalFilter: FilterFn<MessageProps> = (row, columnId, filterValue) => {
        const search = filterValue.toLowerCase()

        switch (filterField) {
            case "id":
                return row.original.id?.toString().toLowerCase().includes(search)
            case "query":
                return row.original.query?.toLowerCase().includes(search)
            case "chat":
                return row.original.chat?.toString().toLowerCase().includes(search)
            case "user":
                return row.original.user?.toString().toLowerCase().includes(search)
            default:
                return (
                    row.original.id?.toString().toLowerCase().includes(search) ||
                    row.original.query?.toLowerCase().includes(search) ||
                    row.original.chat?.toString().toLowerCase().includes(search) || 
                    row.original.user?.toString().toLowerCase().includes(search)
                )
        }
    }

    const filterSearch = [
        {filter: "ทั้งหมด", value: "all"},
        {filter: "ID", value: "id"},
        {filter: "Query", value: "query"},
        {filter: "Chat ID", value: "chat"},
        {filter: "User ID", value: "user"},
    ]

    const formatFilter = (filter: string) => {
        switch(filter) {
            case("all"):
                return "ทั้งหมด"
            case("id"):
                return "ID"
            case("query"):
                return "Query"
            case("chat"):
                return "Chat ID"
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
        data: filteredData,
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
                pageSize: 12
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

    
                // *active Row
                const [activeRow, setActiveRow] = useState<MessageProps | null>(null)

                const handleActiveRow = (row: MessageProps | null) => {
                    if (!row) return
                    setActiveRow(row)
                }


    const msgRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(msgRef, () => {
        setActiveRow(null)
    })

    const deleteRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(deleteRef, () => {
        setConfirmDelete(null)
    })



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
            <div className={`data-container ${isCompact ? 'table-layout' : ''}`}>
                <div className={`msg-history-section ${activeRow ? 'show' : ''}`} ref={msgRef}>
                    <div className="msg-history-bg">
                        <div className="close-upload">
                            <button type="button"
                                onClick={() => {
                                    setActiveRow(null)
                                }}>
                                <X size={17}/>
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', margin: '10px' }}>ID {activeRow?.id || ''}</p>
                        <div className="msg-history">
                            <div className="msg-query">
                                <div className="msg-bubble">
                                    <span>{activeRow?.query}</span>
                                </div>
                            </div>
                            <div className="msg-answer">
                                <span><MarkdownRenderer content={activeRow?.answer || ''}/></span>
                            </div>
                        </div>
                        <div className="delete-msg">
                            <button 
                                type="button"
                                onClick={() => {
                                    if (!activeRow?.id) return
                                    setConfirmDelete(activeRow?.id)
                                }}
                                style={{ color: 'var(--color-alert)' }}>
                                    <Trash2 size={17}/>ลบข้อความ
                            </button>
                            { confirmDelete && (
                                <DeleteTable
                                    id={activeRow?.id || 0}
                                    onCancel={setConfirmDelete}
                                    onSubmit={submitDeleteData}/>
                            )}
                        </div>
                    </div>
                </div>
                { activeRow && <div className="upload-fade" /> }
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
                    <div className="table-filters">
                        <div className="filters">
                            <p>Rating : </p>
                            <CustomDropdown
                                value={filterRating}
                                onChange={setFilterRating}
                                options={[
                                    { value: "", label: "ทั้งหมด" },
                                    { value: "0", label: "0 คะแนน" },
                                    { value: "1", label: "1 คะแนน" },
                                    { value: "2", label: "2 คะแนน" },
                                    { value: "3", label: "3 คะแนน" },
                                    { value: "4", label: "4 คะแนน" },
                                    { value: "5", label: "5 คะแนน" },
                                ]}
                                dropdownKey="rating"/>
                        </div>
                    </div>
                </div>
                { activeLoading ? (
                    <Loading />
                ) : (
                    <Tables
                        tableInfo={tableInfo}
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