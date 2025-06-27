'use client'

import "@/app/styles/style-Sidebar-Db.css"
import { useEffect, useState } from "react"
import { PanelRightOpen, House, Blocks, FolderOpen, ContactRound, Inbox, MessagesSquare  } from 'lucide-react';
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SidebarProp {
    sidebar: boolean
    closeSidebar: () => void
}

export default function Sidebar({ sidebar, closeSidebar }: SidebarProp ) {
    const router = useRouter()
    const { data: session } = useSession()
    useEffect(() => {
        if (typeof session === "undefined") return
    }, [session])



    const [scale, setScale] = useState<boolean>(false)
    useEffect(() => {
        const CheckResize = () => {
            setScale(window.innerWidth <= 768)
        }
        CheckResize()
        
        window.addEventListener('resize', CheckResize)

        return () => {
            window.removeEventListener('resize', CheckResize)
        }
    }, [])


    const pathname = usePathname()
    const isActiveURL = (path: string) => {
        return pathname === path
    }


    return (
        <>
            <div className="sidebar">
                <div className={`sidebar-section ${sidebar ? "open" : ""}`}>
                    <div className="sidebar-header">
                        <button 
                            type="button"
                            className="menu-close-bt"
                            onClick={closeSidebar}>
                                <PanelRightOpen />
                        </button>
                    </div>
                    <div className="sidebar-list">
                        <h1>ECP Ai</h1>
                        <div className="sidebar-list-1" >
                            <Link 
                                href='/dashboard'
                                className={isActiveURL('/dashboard') ? "activeURL" : ""}>
                                    <Blocks />Dashboard
                            </Link>
                        </div>
                        <div className="sidebar-list-2">
                            <p>เอกสาร</p>
                            <Link 
                                href='/dashboard/files'
                                className={isActiveURL('/dashboard/files') ? "activeURL" : ""}>
                                    <FolderOpen />เอกสาร
                            </Link>
                            {/* <Link 
                                href='/dashboard/create-file'
                                className={isActiveURL('/dashboard/create-file') ? "activeURL" : ""}>
                                    <FilePlus />สร้างเอกสาร
                            </Link> */}
                        </div>
                        <div className="sidebar-list-3">
                            <p>ข้อมูล</p>
                            <Link 
                                href='/dashboard/users'
                                className={isActiveURL('/dashboard/users') ? "activeURL" : ""}>
                                    <ContactRound />ผู้ใช้งาน
                            </Link>
                            <Link 
                                href='/dashboard/chats'
                                className={isActiveURL('/dashboard/chats') ? "activeURL" : ""}>
                                    <Inbox />ห้องสนทนา
                            </Link>
                            <Link 
                                href='/dashboard/messages'
                                className={isActiveURL('/dashboard/messages') ? "activeURL" : ""}>
                                    <MessagesSquare />ข้อความ
                            </Link>
                        </div>
                    </div>
                    <div className="homepage-back">
                        <button 
                            type="button"
                            onClick={() => router.replace('/')}>
                                <House />Homepage
                        </button>
                    </div>
                </div>
            </div>
            { sidebar && scale && (<div className="sidebar-fade" onClick={closeSidebar} />)}
        </>
    )
}