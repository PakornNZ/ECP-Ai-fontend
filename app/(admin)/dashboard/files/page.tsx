'use client'

import "@/app/styles/style-FileUpload.css"
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
import { ChevronDown, Download, FileText, Paperclip, Plus, Settings, X } from "lucide-react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Arlert, CustomDropdown, EditFiles, Loading } from "@/app/components/object/object"
import Tables from "@/app/components/dashboard/table"
import { FormatDateTime } from "@/utils/formatDateTime"
import LoadingFull from "@/app/components/dashboard/LoadingFull"
import { Error } from "@/app/components/dashboard/Error"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { useOnClickOutside } from "@/app/components/useOnClickOutside"

interface FilesProps {
    id: number
    name: string
    detail: string
    type: string
    chunk: string
    user: number
    updatedAt: string
    createdAt: string
}

export default function Files() {
    const [globalFilter, setGlobalFilter] = useState<string>("")
    const [filterField, setFilterField] = useState<string>("all")
    const [clearFilter, setClearFilter] = useState<boolean>(false)
    const [fileData, setFileData] = useState<FilesProps[]>([])
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
                                    const [editForm, setEditForm] = useState<Partial<FilesProps>>({})

                                    const handleRowEdit = (row: FilesProps | null) => {
                                        if (row === null) {
                                            setEditingRow(null)
                                            setEditForm({})
                                        } else {
                                            setEditingRow(row.id)
                                            setEditForm(row)
                                        }
                                    }

                                    const handleSaveEditFile = async (data: Partial<FilesProps>) => {
                                        if (!data) return
                                        setEditingRow(null)
                                        setEditForm({})

                                        const payload = {
                                            id: data.id,
                                            name: data.name,
                                            detail: data.detail ? data.detail : null,
                                            type: data.type
                                        }

                                        try {
                                            const res = await axios.put('/api/dashboard/files/edit', payload)
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                data.updatedAt = new Date().toISOString()
                                                setFileData(prev => 
                                                    prev.map(file => 
                                                        file.id === editingRow ? { ...file, ...data } : file
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
                                            const res = await axios.delete('/api/dashboard/files/delete', { data: id })
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setFileData((prev) => {
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


                                    // * download file
                                    const handleDownloadFile = async (id: number | null) => {
                                        if (!id) return

                                        try {
                                            const res = await axios.post('/api/dashboard/files/download', {id}, {
                                                responseType: 'blob'
                                            })
                                            const blob = new Blob([res.data], { type: res.headers['content-type'] })
                                            const url = window.URL.createObjectURL(blob)
                                            const disposition = res.headers['content-disposition']
                                            const file_match = disposition?.match(/filename=?(.+)?/)
                                            const file_name = decodeURIComponent(file_match?.[1])
                                            const link = document.createElement('a')
                                            link.href = url
                                            link.download = file_name
                                            document.body.appendChild(link)
                                            link.click()
                                            link.remove()

                                            window.URL.revokeObjectURL(url)
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
                        const fetchFileData = async () => {

                            const res = await axios.get('/api/dashboard/files')
                            const resData = res.data
                            if(resData.status === 1) {
                                return resData.data
                            }
                            return []
                        }
                        
                        const { data, isLoading, error, refetch } = useQuery({
                            queryKey: ['file'],
                            queryFn: fetchFileData,
                            staleTime: 5 * 60 * 1000,
                            gcTime: 10 * 60 * 1000,
                            refetchOnWindowFocus: false,
                            refetchOnMount: false,
                            retry: 1,
                        })

                        useEffect(() => {
                            if (data) {
                                setFileData(data)
                            }
                        }, [data])


    // * กรองข้อมูล สำหรับค้นหา
    const [filterType, setFilterType] = useState<string>("")

    const filteredData = useMemo(() => {
        return fileData.filter(file => {
            if (filterType && String(file.type) !== filterType) {
                return false
            }
            
            return true
        })
    }, [fileData, filterType])

    const columns: ColumnDef<FilesProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: 'File name',
            cell: ({ row }) => 
                <div className="table-user-container">
                    <div className="table-user-detail">
                        <p>{row.original.name}</p>
                        <span>{row.original.detail ? row.original.detail : '-' }</span>
                    </div>
                </div>
        },
        {
            accessorKey: 'type',
            header: 'Type',
            enableSorting: true,
        },
        {
            accessorKey: 'chunk',
            header: 'Chunk',
            enableSorting: true,
        },
        {
            accessorKey: 'user',
            header: 'User ID',
            enableSorting: true
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
                    <button type="button"onClick={(e) => {
                            handleDownloadFile(row.original.id)
                            e.stopPropagation()
                        }}>
                        <Download/>
                    </button>
                </div>
            )
        }
    ]


    const [openDropdown, setOpenDropdown] = useState<boolean>(false)
    const customGlobalFilter: FilterFn<FilesProps> = (row, columnId, filterValue) => {
        const search = filterValue.toLowerCase()

        switch (filterField) {
            case "id":
                return row.original.id?.toString().toLowerCase().includes(search)
            case "name":
                return row.original.name?.toLowerCase().includes(search)
            case "detail":
                return row.original.detail?.toLowerCase().includes(search)
            case "user":
                return row.original.user?.toString().toLowerCase().includes(search)
            default:
                return (
                    row.original.id?.toString().toLowerCase().includes(search) ||
                    row.original.name?.toLowerCase().includes(search) ||
                    row.original.detail?.toLowerCase().includes(search) ||
                    row.original.user?.toString().toLowerCase().includes(search)
                )
        }
    }

    const filterSearch = [
        {filter: "ทั้งหมด", value: "all"},
        {filter: "ID", value: "id"},
        {filter: "File name", value: "name"},
        {filter: "Detail", value: "detail"},
        {filter: "User ID", value: "user"},
    ]

    const formatFilter = (filter: string) => {
        switch(filter) {
            case("all"):
                return "ทั้งหมด"
            case("id"):
                return "ID"
            case("name"):
                return "File name"
            case("detail"):
                return "Detail"
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


            // * file upload
            const [UploadSection, setUploadSection] = useState<boolean>(false)
            const [fileUpload, setFileUpload] = useState<File[]>([])
            const [fileName, setFileName] = useState<string>('')
            const [fileDetail, setFileDetail] = useState<string>('')
            const [cancelTopic, setCancelTopic] = useState<boolean>(false)
            const [isUpload, setIsUpload] = useState<boolean>(false)

            const [isChunk, setIsChunk] = useState<string>('512')
            const chunks = [
                {value: '256'},
                {value: '512'},
                {value: '768'},
                {value: '1024'},
                {value: '8192'},
            ]
            const handleClearUploadSection = () => {
                setUploadSection(false)
                setFileUpload([])
                setFileName("")
                setFileDetail("")
                setIsUpload(false)
                setIsChunk('512')
            }

            const handleChunkSize = () => {
                const chunkSize = Number(isChunk)
                if (chunkSize > 8192) {
                    setIsChunk('8192')
                } else if (chunkSize < 256) {
                    setIsChunk('512')
                }
            }

            const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                const files = Array.from(e.target.files ?? [])

                if (fileUpload.length + files.length > 5) {
                    setArlertMessage({
                        color: false,
                        message: "เพิ่มได้ไม่เกิน 5 เอกสาร"
                    })
                    const timeOutAPI = setTimeout(() => {
                        setArlertMessage({
                            color: false,
                            message: ""
                        })
                    }, 6000)
                    return () => clearTimeout(timeOutAPI)
                } else {
                    files.forEach(file => {
                        const fileSplit = file.name.split('.')[1]
                        if (["docx", "json", "pdf", "txt"].includes(fileSplit)) {
                            setFileUpload(prev => [...prev, file])
                        }
                    })
                }
            }
            
            useEffect(() => {
                setCancelTopic( fileUpload.length > 1 ? true : false)
            }, [fileUpload])

            const handleDeleteUploadFile = (fileIndex: number) => {
                setFileUpload(fileUpload.filter((files, index) => index !== fileIndex))
            }


                                    // * upload file
                                    const submitUploadFile = async () => {
                                        if (fileUpload.length === 0) return handleClearUploadSection()
                                        if (fileUpload.length > 5) return
                                        const formData = new FormData()
                                        fileUpload.forEach((file) => {
                                            formData.append("files", file)
                                        })
                                        
                                        if (fileUpload.length === 1) {
                                            const name = fileName !== '' ? fileName : fileUpload[0].name.split('.')[0]
                                            formData.append("name", name)
                                            formData.append("detail", fileDetail)
                                        }
                                        const chunkSize = isChunk === '' || Number(isChunk) > 8192 || Number(isChunk) < 256
                                        formData.append("chunk", chunkSize ? '512' : isChunk)
                                        try {
                                            setIsUpload(true)
                                            const res = await axios.post('/api/dashboard/files/upload', formData)
                                            const resData = res.data

                                            if (resData.status === 1) {
                                                setFileData(prev => [...prev, ...resData.data])
                                                handleClearUploadSection()
                                            }
                                        } catch (error: unknown) {
                                            setIsUpload(false)
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


    // * ขนาดหน้าจอ responsesive
    const [isCompact, setIsCompact] = useState(false)

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
                                return <LoadingFull />
                            }
    
                            if (error) {
                                return <Error />
                            }

    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <EditFiles
                editingRow={editingRow}
                activeEditingRow={setEditingRow}
                editForm={editForm}
                activeSaveForm={handleSaveEditFile}
                onSubmitDelete={submitDeleteData}
            />
            <div className={`data-container ${isCompact ? 'table-layout' : ''}`}>
                <div className={`upload-section ${UploadSection ? 'show' : ''}`}>
                    <div className="upload-bg">
                        <div className="close-upload">
                            <button type="button"
                                onClick={handleClearUploadSection}>
                                <X size={17}/>
                            </button>
                        </div>
                        { !cancelTopic &&
                            <>
                                <p>ชื่อเอกสาร</p>
                                <input 
                                    type="text"
                                    style={{ width: '70%' }}
                                    value={fileName ?? ''}
                                    onChange={(e) => setFileName(e.target.value)}/>
                                <p>รายละเอียด</p>
                                <textarea
                                    style={{ width: '94%' }}
                                    rows={2}
                                    value={fileDetail ?? ''}
                                    onChange={(e) => setFileDetail(e.target.value)}/>
                            </>
                        }
                        <div className="chunk-select">
                            <p>ขนาด Chunk</p>
                            <input 
                                    type="text"
                                    style={{ width: '30%' }}
                                    placeholder="256-8192"
                                    value={isChunk}
                                    onChange={(e) => {
                                        const value = /^[0-9]+$/.test(e.target.value) ? e.target.value : ''
                                        setIsChunk(value)
                                    }}
                                    onBlur={handleChunkSize}/>
                            <div className="chunks-list">
                                {chunks.map((value, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setIsChunk(value.value)
                                        }}
                                        type="button"
                                        className={`dropdown-item ${value.value === isChunk ? 'select' : ''}`}>
                                            {value.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="upload">
                            <input 
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".docx,.json,.pdf,.txt"
                                className="hidden"
                                style={{ display: 'none' }}
                                onChange={handleUploadFile}/>
                            <label 
                                htmlFor="file-upload"
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = Array.from(e.dataTransfer.files ?? [])

                                    if (fileUpload.length + files.length > 5) {
                                        setArlertMessage({
                                            color: false,
                                            message: "เพิ่มได้ไม่เกิน 5 เอกสาร"
                                        })
                                        const timeOutAPI = setTimeout(() => {
                                            setArlertMessage({
                                                color: false,
                                                message: ""
                                            })
                                        }, 6000)
                                        return () => clearTimeout(timeOutAPI)
                                    } else {
                                        files.forEach(file => {
                                            const fileSplit = file.name.split('.')[1]
                                            if (["docx", "json", "pdf", "txt"].includes(fileSplit)) {
                                                setFileUpload(prev => [...prev, file])
                                            }
                                        })
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                }}>
                                    <div>
                                        <Paperclip
                                            size={35}/>
                                        เลือกเอกสาร
                                    </div>
                            </label>
                        </div>
                        { fileUpload.length !== 0 &&
                            <div className="clip-file">
                                {fileUpload.map((files, index) => (
                                    <div className="file-lists" key={index}>
                                        <FileText size={15} style={{ marginLeft: '10px' }}/><p>{files.name}</p>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                handleDeleteUploadFile(index)
                                            }}>
                                                <X size={15}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        }
                        <div className="edit-save">
                            <button
                                disabled={isUpload}
                                type="button"
                                className="edit-save-button"
                                onClick={submitUploadFile}>
                                    { isUpload ? 
                                        <>
                                            <Loading />
                                        </>
                                    :
                                        "เพิ่มเอกสารที่เลือก"
                                    }
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', opacity: '0.5', paddingTop: '5px', margin: '0', textAlign: 'center'}}>
                            อนุญาตเฉพาะเอกสาร docx, json, pdf และ txt
                        </p>
                    </div>
                </div>
                { UploadSection && <div className="upload-fade" /> }
                <div className="table-header">
                    <div style={{ display: "flex", justifyContent: "space-between", flexFlow: 'wrap', gap: '10px' }}>
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
                        <div className="file-upload">
                            <button type="button"
                                onClick={() => setUploadSection(true)}>
                                <Plus size={16}/>
                                    เพิ่มเอกสาร
                            </button>
                        </div>
                    </div>
                    <div className="table-filters">
                        <div className="filters">
                            <p>Type : </p>
                            <CustomDropdown
                                value={filterType}
                                onChange={setFilterType}
                                options={[
                                    { value: "", label: "ทั้งหมด" },
                                    { value: "docx", label: "docx" },
                                    { value: "json", label: "json" },
                                    { value: "pdf", label: "pdf" },
                                    { value: "txt", label: "txt" },
                                ]}
                                dropdownKey="type"/>
                        </div>
                    </div>
                </div>
                { activeLoading ? (
                    <LoadingFull />
                ) : (
                    <Tables
                        tableInfo={tableInfo}
                        handleRowEdit={handleRowEdit}
                        tableCount={tableInfo.getPrePaginationRowModel().rows.length}
                        isRefetch={setActiveLoading}
                        setIsCompact={setIsCompact}
                    />
                )}
            </div>
        </>
    )
}