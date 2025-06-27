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
import { ChevronDown, Settings,  X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Arlert, CustomDropdown, EditProfile } from "@/app/components/object/object"
import Tables from "@/app/components/dashboard/table"
import { FormatDateTime } from "@/utils/formatDateTime"
import axios from "axios"
import { useQuery } from '@tanstack/react-query'
import Loading from "@/app/components/dashboard/LoadingFull"
import { Error } from "@/app/components/dashboard/Error"
import { encrypt } from "@/utils/crypto"
import { useRouter } from "next/navigation"
import { useOnClickOutside } from "@/app/components/useOnClickOutside"
import Image from "next/image"

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

export default function Users() {
    const router = useRouter()
    const [globalFilter, setGlobalFilter] = useState<string>("")
    const [filterField, setFilterField] = useState<string>("all")
    const [clearFilter, setClearFilter] = useState<boolean>(false)
    const [userData, setUserData] = useState<UserProps[]>([])
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
                                            id: data.id,
                                            name: data.name ? data.name : null,
                                            email: data.email ? data.email : null,
                                            provider: data.provider ? data.provider : null,
                                            role: roleFormat,
                                            verified: data.verified ? data.verified : null
                                        }

                                        try {
                                            const res = await axios.put('/api/dashboard/users/edit', payload)
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setUserData(prev => 
                                                    prev.map(user => 
                                                        user.id === editingRow ? { ...user, ...data } : user
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
                                            const res = await axios.delete('/api/dashboard/users/delete', { data: id })
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setUserData((prev) => {
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

                                


    // * กรองข้อมูล สำหรับค้นหา
    const [filterRole, setFilterRole] = useState<string>("")
    const [filterVerified, setFilterVerified] = useState<string>("")
    const [filterProvider, setFilterProvider] = useState<string[]>([])

    const handleActiveRow = async (row: UserProps | null) => {
        if (!row) return

        const encodeChatId = encodeURIComponent(await encrypt(row?.id))
        router.push(`/dashboard/profile/${encodeChatId}`)
    }
    

                        // * ดึงข้อมูล
                        const fetchUserData = async () => {

                            const res = await axios.get('/api/dashboard/users')
                            const resData = res.data

                            if(resData.status === 1) {
                                return resData.data
                            }
                            return []

                        }
                        
                        const { data, isLoading, error, refetch } = useQuery({
                            queryKey: ['users'],
                            queryFn: fetchUserData,
                            staleTime: 5 * 60 * 1000,
                            gcTime: 10 * 60 * 1000,
                            refetchOnWindowFocus: false,
                            refetchOnMount: false,
                            retry: 1,
                        })

                        useEffect(() => {
                            if (data) {
                                setUserData(data)
                            }
                        }, [data])


    



    const filteredData = useMemo(() => {
        handleRowEdit(null)
        return userData.filter(user => {
            if (filterRole && user.role !== filterRole) {
                return false
            }
            
            if (filterVerified) {
                const isVerified = filterVerified === "true"
                if (user.verified !== isVerified) {
                    return false
                }
            }
            
            if (filterProvider.length > 0 && !filterProvider.includes(user.provider)) {
                return false
            }
            
            return true
        })
    }, [userData, filterRole, filterVerified, filterProvider])

    const handleProviderChange = (value: string) => {
        if (value === "") {
            setFilterProvider([])
            return
        }

        setFilterProvider(prev => {
            if (prev.includes(value)) {
                return prev.filter(p => p !== value)
            }

            if (prev.length < 2) {
                return [...prev, value]
            }

            return [...prev.slice(1), value]
        })
    }

    const columns: ColumnDef<UserProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            cell: ({ row }) => (
                <div className="table-user-container">
                    <Image src={row.original.image ? row.original.image : "/profile/profile-user.png"} 
                        alt="profile-user" width={33} height={33} />
                    <div className="table-user-detail">
                        <p>{row.original.name}</p>
                        <span>{row.original.email ? row.original.email : '-' }</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Role',
            enableSorting: true,
            cell: ({ row }) => {
                const role = row.original.role
                let roleLabel = ""
                switch (role) {
                    case "admin":
                        roleLabel = "Admin"
                        break
                    case "user":
                        roleLabel = "User"
                        break
                    default:
                        roleLabel = ""
                }

                return <span>{roleLabel}</span>
            }
        },
        {
            accessorKey: 'verified',
            header: 'Verified',
            cell: ({ row }) => {
                return row.original.verified !== null ? 
                    (
                        row.original.verified ? (
                            <div className="verified-state">
                                <div style={{ background: "#7bc549" }} ><span>ยืนยัน</span></div>
                            </div>
                        ) : (
                            <div className="verified-state">
                                <div style={{ background: "#df4e4e" }} ><span>ไม่ยืนยัน</span></div>
                            </div>
                        )
                    ) :
                    (
                        <span>-</span>
                    )
            },
            enableSorting: true,
        },
        {
            accessorKey: 'provider',
            header: 'Provider',
            enableSorting: true,
            cell: ({ row }) => {
                const provider = row.original.provider
                let providerLabel = ""
                switch (provider) {
                    case "credentials":
                        providerLabel = "Credentials"
                        break
                    case "google":
                        providerLabel = "Google"
                        break
                    case "line":
                        providerLabel = "Line"
                        break
                    default:
                        providerLabel = "-"
                }

                return <span>{providerLabel}</span>
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            enableSorting: true,
            cell: ({ row }) => (
                <span style={{ opacity: '0.8' }}>{FormatDateTime(row.original.createdAt)}</span>
            )
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
    const customGlobalFilter: FilterFn<UserProps> = (row, columnId, filterValue) => {
        const search = filterValue.toLowerCase()

        switch (filterField) {
            case "id":
                return row.original.id?.toString().toLowerCase().includes(search)
            case "name":
                return row.original.name?.toLowerCase().includes(search)
            case "email":
                return row.original.email?.toLowerCase().includes(search)
            default:
                return (
                    row.original.id?.toString().toLowerCase().includes(search) ||
                    row.original.name?.toLowerCase().includes(search) ||
                    row.original.email?.toLowerCase().includes(search)
                )
        }
    }

    const filterSearch = [
        {filter: "ทั้งหมด", value: "all"},
        {filter: "ID", value: "id"},
        {filter: "Name", value: "name"},
        {filter: "Email", value: "email"},
    ]

    const formatFilter = (filter: string) => {
        switch(filter) {
            case("all"):
                return "ทั้งหมด"
            case("id"):
                return "ID"
            case("name"):
                return "Name"
            case("email"):
                return "Email"
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
                pageSize: 8
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
            <EditProfile 
                editingRow={editingRow}
                activeEditingRow={setEditingRow}
                editForm={editForm}
                activeSaveForm={handleSaveEditUser}
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
                    <div className="table-filters">
                        <div className="role filters">
                            <p>Role : </p>
                            <CustomDropdown
                                value={filterRole}
                                onChange={setFilterRole}
                                options={[
                                    { value: "", label: "ทั้งหมด" },
                                    { value: "admin", label: "Admin" },
                                    { value: "user", label: "User" }
                                ]}
                                dropdownKey="role"/>
                        </div>

                        <div className="verified filters">
                            <p>Verified : </p>
                            <CustomDropdown
                                value={filterVerified}
                                onChange={setFilterVerified}
                                options={[
                                    { value: "", label: "ทั้งหมด" },
                                    { value: "true", label: "ยืนยัน" },
                                    { value: "false", label: "ไม่ยืนยัน" }
                                ]}
                                dropdownKey="verified"/>
                        </div>

                        <div className="provider filters">
                            <p>Provider : </p>
                            <CustomDropdown
                                value={filterProvider}
                                onChange={handleProviderChange}
                                options={[
                                    { value: "", label: "ทั้งหมด" },
                                    { value: "credentials", label: "Credential" },
                                    { value: "google", label: "Google" },
                                    { value: "line", label: "Line" }
                                ]}
                                dropdownKey="provider"
                                multiSelect={true}/>
                        </div>
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