'use client'

import { Error } from "@/app/components/dashboard/Error"
import Loading from "@/app/components/dashboard/LoadingFull"
import "@/app/styles/style-Dashboard.css"
import { formatNumber, formatFullNumber } from '@/utils/formatNumber'
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { FolderOpen, Heart, ShieldUser, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import Image from 'next/image'

interface RatingBoardProps {
    rating: number,
    count: number,
    percent: number
}

interface FileBoardProps {
    type: string,
    count: number
}

interface UserBoardProps {
    role: number,
    count: number
}

interface BoardProps {
    rating: {
        avg: number,
        total: number,
        detail: RatingBoardProps[]
    },
    file: {
        total: number,
        detail: FileBoardProps[]
    },
    user: {
        total: number,
        detail: UserBoardProps[]
    }
}

export default function Dashboard () {
    const [boardData, setBoardData] = useState<BoardProps | null>(null)

                        // * ดึงข้อมูล
                        const fetchBoardData = async () => {

                            const res = await axios.get('/api/dashboard/board')
                            const resData = res.data

                            if(resData.status === 1) {
                                return resData.data
                            }
                            return []
                        }
                        
                        const { data, isLoading, error } = useQuery({
                            queryKey: ['board'],
                            queryFn: fetchBoardData,
                            staleTime: 5 * 60 * 1000,
                            gcTime: 10 * 60 * 1000,
                            refetchOnWindowFocus: false,
                            refetchOnMount: false,
                            retry: 1,
                        })

                        useEffect(() => {
                            if (data) {
                                setBoardData(data)
                            }
                        }, [data])


    const file_img = (type: string) => {
        switch(type) {
            case('docx'):
                return '/logo_file/doc.svg'
            case('json'):
                return  '/logo_file/json.png'
            case('pdf'):
                return '/logo_file/pdf.svg'
            case('txt'):
                return '/logo_file/text.svg'
        }
    }

    const formatValue = (data: number) => {
        const { value, suffix } = formatNumber(data)

        return `${value}${suffix}`
    }

    if (isLoading) {
        return <Loading />
    }
    if (error) {
        return <Error />
    }

    return (
        <>
            <div className="station">
                <div className="total-station">
                    <div className="total-station-bg">
                        <div className="total-station-data">
                            <UserRound/>
                            <h2>ผู้ใช้งาน</h2>
                        </div>
                        <p>{formatValue(boardData?.user.total ?? 0)}</p>
                    </div>
                    <div className="total-station-bg">
                        <div className="total-station-data">
                            <Heart style={{ fill: 'var(--color-font-white)' }}/>
                            <h2>การให้คะแนน</h2>
                        </div>
                        <p>{formatValue(boardData?.rating.total ?? 0)}</p>
                    </div>
                    <div className="total-station-bg">
                        <div className="total-station-data">
                            <FolderOpen />
                            <h2>เอกสาร</h2>
                        </div>
                        <p>{formatValue(boardData?.file.total ?? 0)}</p>
                    </div>
                </div>
                <div className="ratings-station">
                    <div className="rating-topic">
                        <div className="topic-header">
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <Heart className="topic-icon"/>
                                <span className="topic-span">คะแนนรวมเฉลี่ย</span>
                            </div>
                            <h1>{boardData?.rating.avg}<span>คะแนน</span></h1>
                            <p>จำนวนการให้คะแนนทั้งหมด {formatFullNumber(boardData?.rating.total ?? 0)} ครั้ง</p>
                            <Heart className="svg-fade heart"/>
                        </div>
                        <div className="rating-score">
                            {boardData?.rating.detail.map((data, index) => 
                                <div className="score-section" key={index}>
                                    <div className="score-section-topic">
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <span>{data.rating} คะแนน</span>
                                            <p className="many-rating">{formatFullNumber(data.count)} ครั้ง</p>
                                        </div>
                                        <p style={{ fontWeight: '500' }}>{data.percent.toFixed(1)}%</p>
                                    </div>
                                    <div className="score" key={index}>
                                        <div className="score-avg" style={{ width: `${data.percent}%` }}/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="files-station">
                    <div className="file-topic">
                        <div className="topic-header">
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <FolderOpen className="topic-icon" style={{ fill: 'none' }}/>
                                <span className="topic-span">เอกสาร</span>
                            </div>
                            <h1>{boardData?.file.total}</h1>
                            <p>จำนวนเอกสารทั้งหมด {boardData?.file.total} เอกสาร</p>
                        </div>
                        <div className="files-list">
                            {boardData?.file.detail.map((data, index) => (
                                <div className="file" key={index}>
                                    <div className="file-logo">
                                        <Image src={file_img(data.type) ?? ''} width={45} height={45} alt="file logo"/>
                                    </div>
                                    <div className="file-info">
                                        <h2>{data.type.toUpperCase()}</h2>
                                        <p><span>{data.count}</span> เอกสาร</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="users-station">
                    <div className="user-topic">
                        <div className="topic-header">
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <UserRound className="topic-icon" style={{ fill: 'none' }}/>
                                <span className="topic-span">บัญชีผู้ใช้งาน</span>
                            </div>
                            <h1>{formatValue(boardData?.user.total ?? 0)}</h1>
                            <p>จำนวนบัญชีผู้ใช้งานทั้งหมด {formatFullNumber(boardData?.user.total ?? 0)} บัญชี</p>
                            <UserRound className="svg-fade"/>
                        </div>
                        <div className="user-detail">
                            {boardData?.user.detail.map((data, index) => (
                                <div className="user" key={index}>
                                    <div className="user-info" style={{ width: '100%' }}>
                                        <h2>
                                            { data.role === 2 ? 
                                                <>
                                                    <ShieldUser /> ผู้ดูแลระบบ
                                                </>
                                            : 
                                                <>
                                                    <UserRound /> ผู้ใช้งานทั่วไป 
                                                </>
                                            }
                                        </h2>
                                        <p>{formatFullNumber(data.count)}
                                            <span className="user-end">บัญชี</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}