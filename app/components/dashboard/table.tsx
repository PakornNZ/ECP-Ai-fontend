'use client'

import {
    Table as ReactTable,
    flexRender,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronUp, RotateCw } from "lucide-react"
import { useEffect, useRef } from "react"

interface DataTablesProps<T> {
    tableInfo: ReactTable<T>
    handleRowEdit?: (row: T | null) => void 
    tableCount: number
    onActiveRow?: (row: T | null) => void
    isRefetch: (status: boolean) => void
    setIsCompact: (status: boolean) => void
}

export default function Tables<T>({ tableInfo, handleRowEdit, tableCount, onActiveRow, isRefetch, setIsCompact } : DataTablesProps<T>) {


    const selectRow = (row : string) => {
        switch(row) {
            case('name'):
                return 'column-left'
            case('query'):
                return 'column-left'
            case('id'):
                return 'column-fixed'
            case('actions'):
                return 'column-fixed'
            case('detail'):
                return 'text-left'
            case('query'):
                return 'text-left.msg'
            default :
                return 'text-center'
        }
    }


        // * ขนาดหน้าจอ responsesive
        const stationRef = useRef<HTMLDivElement | null>(null)
        useEffect(() => {
            const target = stationRef.current
            if (!target) return

            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.contentRect.width < 1024) {
                        setIsCompact(true)
                    } else {
                        setIsCompact(false)
                    }
                }
            })
            observer.observe(target)
            return () => {
                observer.unobserve(target)
            }
        }, [setIsCompact])


    return (
        <>
            <div className="table-container">
                <div className="table-wrap">
                    <div ref={stationRef}
                        className="table-section">
                        <table>
                            <thead>
                                {tableInfo.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => {
                                            const canSort = header.column.getCanSort()
                                            const sortDir = header.column.getIsSorted()
                        
                                            return (
                                                <th
                                                    key={header.id}
                                                    onClick={canSort ? () => {
                                                        const currentSort = header.column.getIsSorted()
                                                        if (!currentSort) {
                                                            header.column.toggleSorting(false)
                                                        } else if (currentSort === 'asc') {
                                                            header.column.toggleSorting(true)
                                                        } else {
                                                            header.column.toggleSorting(false)
                                                        }
                                                    } : undefined}
                                                    style={canSort ? { cursor: 'pointer' } : {}}
                                                    className={selectRow(header.column.id)}>
                                                        { header.column.id !== 'actions' ? (
                                                            flexRender(header.column.columnDef.header, header.getContext())
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => isRefetch(true)}
                                                                    className="refectch-button">
                                                                        <RotateCw />
                                                                </button>
                                                            </>
                                                        )}
                                                    {canSort && (
                                                        <span className="soft-svg">
                                                            { sortDir ? 
                                                                <ChevronUp
                                                                size={16}
                                                                    style={{ 
                                                                        color: "var(--color-font-secondary)",
                                                                        transform: sortDir === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                        transition: 'transform 0.2s ease'
                                                                    }} 
                                                                /> : '' }
                                                        </span>
                                                    )}
                                                </th>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {tableInfo.getRowModel().rows.length > 0 ? (
                                    tableInfo.getRowModel().rows.map(row => (
                                        <tr key={row.id} onClick={() => {
                                                if (onActiveRow) {
                                                    onActiveRow(row.original)
                                                }
                                            }}>
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
                            <div className="table-count">
                                <p>{tableCount} ข้อมูล</p>
                            </div>
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
        </>
    )
}