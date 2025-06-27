'use client'

import { useEffect, useRef, useState } from "react"
import Sidebar from "@/app/components/dashboard/Sidebar"
import { useLocalStorage } from "@/app/hooks/useLocalStorage"
import { PanelRight } from 'lucide-react'
import "@/app/styles/style-DashboardLayout.css"
import "@/app/styles/style-Menu.css"
import { useSession } from "next-auth/react"
import { useOnClickOutside } from "@/app/components/useOnClickOutside"
import SettingUser from "@/app/components/popup/Setting-User-Popup"
import { ProfileUser, LogoutState } from "@/app/components/object/object"
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Loading from "@/app/components/dashboard/LoadingFull"
import Image from 'next/image'

export default function DashboardLayout ({ children }: Readonly<{ children: React.ReactNode; }>) {
    const { data: session } = useSession()
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    }))


    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        if (typeof session === "undefined") return
        const timeOut = setTimeout(() => {
            setLoading(false)
        }, 200)
        return () => clearTimeout(timeOut)
    }, [session])


                            const [activeSetting, setActiveSetting] = useState<boolean>(false)
                            const popupRef = useRef<HTMLDivElement | null>(null)
                            const buttonRef = useRef<HTMLButtonElement | null>(null)
                            useOnClickOutside(popupRef, (event) => {
                                if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                                    setActiveSetting(false)
                                }
                            })
        
                            const handleSettingUser = (state: boolean) => {
                                setActiveSetting(state)
                            }

                            const [isLogoutState, setIsLogoutState] = useState<boolean>(false)
                            const handleLogout = (isLogout: boolean) => {
                                setIsLogoutState(isLogout)
                            }

                            const [isProfileState, setIsProfileState] = useState<boolean>(false)
                            const handleProfileUser = (isProfile: boolean) => {
                                setIsProfileState(isProfile)
                            }


    const [sidebar, setSidebar] = useLocalStorage('sidebar', false)
    const handleSidebar = () => {
        setSidebar(prev => !prev)
    }
    
    const pathname = usePathname()
    const [isShow, setIsShow] = useState<string>("")
    useEffect(() => {
        const path = pathname.split('/')[2] ? pathname.split('/')[2] : pathname.split('/')[1]
        NameDisplay(path)
    }, [pathname])

        const NameDisplay = (path: string) => {
            switch(path) {
                case 'dashboard':
                    setIsShow("Dashboard")
                    break
                case 'files':
                    setIsShow("Files")
                    break
                case 'create-file':
                    setIsShow("Create File")
                    break
                case 'users':
                    setIsShow("Users")
                    break
                case 'chats':
                    setIsShow("Chats")
                    break
                case 'messages':
                    setIsShow("Messages")
                    break
                case 'profile':
                    setIsShow("Profile")
                    break
            }
        }


    if (loading) {
        return (
            <div style={{ width: '100vw', height: '100vh' }}>
                <Loading />
            </div>
        )
    }
    return (
        <>
            <ProfileUser isProfile={isProfileState} setIsProfile={handleProfileUser}/>
            <div className="section">
                <Sidebar 
                    sidebar={sidebar} 
                    closeSidebar={handleSidebar}/>
                <div className="dashboard-section">
                    <div className="menu-section">
                        <div className="menu-bg">
                            { !sidebar ?(
                                <button 
                                    type="button"
                                    className="menu-open-bt"
                                    onClick={handleSidebar}>
                                        <PanelRight />
                                </button>
                            ) : (
                                <div className="menu-open-dis" />
                            )}
                            <h1>{isShow}</h1>
                            <div style={{ position: "relative" }}>
                                <div className="admin-setting">
                                    <button 
                                        ref={buttonRef} 
                                        type="button" 
                                        onClick={() => handleSettingUser(!activeSetting)}>
                                            <Image src={session?.user.image ?? ''} width={30} height={30} alt="pic-profile" />
                                    </button>
                                </div>
                                { activeSetting && (
                                    <SettingUser 
                                        popupRef={popupRef} 
                                        setIsLogout={handleLogout} 
                                        setIsProfile={handleProfileUser} 
                                        setActiveSetting={handleSettingUser} />
                                )}
                                <LogoutState isLogout={isLogoutState} setIsLogout={handleLogout}/>
                            </div>
                        </div>
                    </div>
                    <div className="data-section">
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </div>
                    <div style={{ height: '18px'}}/>
                </div>
            </div>
        </>
    )
}