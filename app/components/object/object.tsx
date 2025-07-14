"use client"

import Image from "next/image";
import LogoWhite from "@/public/logo/logo-white.svg"
import GoogleLogo from "@/public/logo/google-brands.svg"
import LineLogo from "@/public/logo/line-brands.svg"
import { useOnClickOutside } from "@/app/components/useOnClickOutside";
import { Copy, Heart, Check, AtSign, CircleAlert, X, Mail, ChevronDown, Trash2 } from 'lucide-react'
import "@/app/styles/style-Object.css"
import { Ellipsis } from 'react-css-spinners'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from "next-auth/react";
import axios from 'axios'
import { useTheme } from "@/app/theme-context";

export const Loading = () => {
    return (
        <>
            <div className="loading">
                <Ellipsis />
            </div>
        </>
    )
}

interface ArlertProps {
    messageArlert: {
        color: boolean
        message: string
    }
}

export const Arlert = ({ messageArlert }: ArlertProps) => {
    const [isState, setIsState] = useState<boolean>(false)

    useEffect(() => {
        if (messageArlert.message == "") return
        setIsState(true)

        setTimeout(() => {
            setIsState(false)
        }, 5000)
    }, [messageArlert])
    
    return (
        <>
            { messageArlert.color ? 
                <>
                    <div style={{ background: "var(--color-font)" }} 
                        className={`arlert-section ${isState ? "show" : ""}`}>
                        <Check style={{ color: "var(--color-background)" }}/>
                        <p style={{ color: "var(--color-background)" }}>
                            {messageArlert.message}
                        </p>
                    </div>
                </> :
                <>
                    <div style={{ background: "var(--color-alert)" }} 
                        className={`arlert-section ${isState ? "show" : ""}`}>
                        <CircleAlert style={{ color: "var(--color-font-white)" }}/>
                        <p style={{ color: "var(--color-font-white)" }}>
                            {messageArlert.message}
                        </p>
                    </div>
                </>
            }
        </>
    )
}

interface ArlertEmailProps {
    messageArlert: string
}

export const ArlertEmail = ({ messageArlert }: ArlertEmailProps) => {

    const [isState, setIsState] = useState<boolean>(false)
    const [isArlert, setIsArlert] = useState<string>("")

    useEffect(() => {
        if (messageArlert == "") {
            setIsState(false)
            setTimeout(() => {
                setIsArlert("")
            }, 500)
        } else {
            setIsState(true)
            setIsArlert(messageArlert)
        }
    }, [messageArlert])

    return (
        <>
            <div className={`arlert-email-section ${isState ? "show" : ""}`}>
                <div className="arlert-email-object">
                    <AtSign />
                    <span>{isArlert}</span>
                </div>
                <div className="arlert-email-object2" />
            </div>
            
        </>
    )
}


// * จัดการการแชทสำหรับ ผู้ใช้งาน
interface ManageChatProps {
    msg_id: number | null
    answer: string | null
    isRating: number
}

export const ManageChat = ({ msg_id, answer, isRating } : ManageChatProps ) => {
    const { data : session } = useSession()
    const [rating, setRating] = useState<number>(0)
    const [hover, setHover] = useState<number | null>(null)
    const [isCopy, setIsCopy] = useState<boolean>(false)
    const [playAnimation, setPlayAnimation] = useState<boolean>(false)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        setRating(isRating)
    }, [isRating])

    const handleExpand = (status: boolean) => {
        if (status) {
            const timeout = setTimeout(() => setIsExpanded(true), 200)
            return () => clearTimeout(timeout)
        } else {
            setIsExpanded(false)
        }
    }
    
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)
    const handRating = async (value: number) => {
        if (value == rating) {
            setRating(0)
            setHover(null)
            value = 0
        } else {
            setRating(value)
        }

        const payload = {
            "msg_id": msg_id,
            "rating": value
        }
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                await axios.put('/api/data/rating', payload)
            } catch (error: unknown) {
                setRating(0)
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
        }, 4000)
    }



    const handleDisplayRating = (value: number) => {
        if (value > rating) {
            setHover(value)
        } else {
            setHover(null)
        }
    }

    const [arlertMessage, setArlertMessage] = useState({
        color: true,
        message: ""
    })
    
    const handleCopy = async () => {
        if (!answer || isCopy) return

        try {
            if (window.isSecureContext && navigator.clipboard) {
                await navigator.clipboard.writeText(answer)
            } else {
                // * ใช้แทน หากไม่มี https
                const textArea = document.createElement("textarea")
                textArea.value = answer
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()

                try {
                    document.execCommand('copy')
                } catch (error) {
                    console.error("Failed to copy: ", error)
                }
                document.body.removeChild(textArea)
            }

            // * เมื่อคัดลอกสำเร็จ
            setIsCopy(true)
            setPlayAnimation(true)
            setArlertMessage({
                color: true,
                message: "คัดลอกข้อความสำเร็จ"
            })

            const timeout = setTimeout(() => {
                setIsCopy(false)
                setPlayAnimation(true)
                setArlertMessage({
                    color: true,
                    message: ""
                })
            }, 6000)
            return () => clearTimeout(timeout)
        } catch (error) {
            console.error("Failed to copy: ", error)
        }
    }

    useEffect(() => {
        if (!playAnimation) return
        const timeout = setTimeout(() => setPlayAnimation(false), 500)
        return () => clearTimeout(timeout)
    }, [playAnimation])
    
    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <div className="manage-chat">
                { session && (
                    <>
                        <p className={`rating ${ hover || rating > 0 ? "show" : "" }`}>{ rating == 0 || hover ? hover : rating} คะแนน</p>
                        <div className={`rate-for-bot ${ rating > 0 ? "show" : "" }`}
                            onMouseLeave={() => {
                                handleExpand(false)
                                handleDisplayRating(0)
                            }}
                            onMouseEnter={() => handleExpand(true)}>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <Heart key={value}
                                    onClick={() => {if (isExpanded) handRating(value)}}
                                    onMouseEnter={() => {if (isExpanded) handleDisplayRating(value)}}
                                    fill={ (hover ?? rating) >= value ? "var(--color-main)" : "none" }
                                />
                            ))}
                        </div>
                    </>
                )}
                <button type="button" right-title="คัดลอก" onClick={handleCopy} className={`copy-button ${playAnimation ? "play" : ""}`}>
                    {isCopy ? <Check /> : <Copy />}
                </button>
            </div>  
        </>
    )
}

interface SettingLogoutProps {
    isLogout: boolean
    setIsLogout: (isLogout: boolean) => void
}

export const LogoutState = ({ isLogout, setIsLogout }: SettingLogoutProps) => {
    const logoutRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(logoutRef, () => {
        setIsLogout(false)
    })

    const handleLogout = async () => {
        await signOut({redirect: true})
    }

    return (
        <>
            { isLogout && (
                <div className="logout-popup" ref={logoutRef}>
                    <div className="logout-box">
                        <p>ยืนยันการลงชื่อออก</p>
                        <div className="logout-button">
                            <button type="button" 
                                className="logout-active"
                                style={{ background: "var(--color-alert)", color: "var(--color-font-white)"}}
                                onClick={handleLogout}>
                                    ยืนยัน
                            </button>
                            <button type="button"
                                onClick={() => {
                                    setIsLogout(false)
                                }}>
                                    ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

interface SettingProfileProps {
    isProfile: boolean
    setIsProfile: (setIsProfile: boolean) => void
}

export const ProfileUser = ({ isProfile, setIsProfile }: SettingProfileProps) => {
    const route = useRouter()
    const popupRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(popupRef, () => {
        setIsProfile(false)
    })

    const { data: session } = useSession()
    useEffect(() => {
        if (typeof session === "undefined") return
    }, [session])
    
    const formatDate = (dateString: string) => {
        if (dateString == "") return
        const formated = new Date(dateString).toLocaleDateString()
        return formated
    }

    const { theme, setTheme } = useTheme()
    const themeOptions = [
        { id: 1, theme: 'ระบบ', value: 'system' },
        { id: 2, theme: 'สว่าง', value: 'light' },
        { id: 3, theme: 'มืด', value: 'dark' }
    ]

    return (
        <>
            <div className={`profile-popup ${ isProfile ? "active" : ""}`}>
                <div className="profile-bg" ref={popupRef}>
                    <div className="profile-section-1">
                        <button type="button" onClick={() => setIsProfile(false)}><X /></button>
                        <div className="backdrop">
                            { LogoWhite &&
                                <>
                                    <Image src={LogoWhite} alt="logo-white" className="backdrop-logo-1"  width={200} height={200}/>
                                    <Image src={LogoWhite} alt="logo-white" className="backdrop-logo-2"/>
                                    <Image src={LogoWhite} alt="logo-white" className="backdrop-logo-3"/>
                                </>
                            }
                        </div>
                        { session?.user.image && <Image src={session?.user.image} width={90} height={90} alt="photo-profile-user" className="photo-user"/>}
                    </div>
                    <div className="profile-section-2">
                        <div className="empty-section" style={{ width: "100%", height: "60px" }}/>
                        <div className="data-user">
                            <h1 className="name-user">{session?.user.name.trim()}</h1>
                            <div className="provider-user">
                                { session?.user.provider &&
                                    <>
                                        { session?.user.provider == "credentials" && (
                                            <Mail />
                                        )}
                                        { session?.user.provider == "google" && (
                                            <Image src={GoogleLogo} alt="google-logo"  width={20} height={20}/>
                                        )}
                                        { session?.user.provider == "line" && (
                                            <Image src={LineLogo} alt="line-logo" width={20} height={20}/>
                                        )}
                                    </>
                                }
                                <span className="date-user">ลงทะเบียน {formatDate(session?.user.create_at || "")}</span>
                            </div>
                            <div style={{ background: "var(--background)", padding: "15px", margin: "25px", display: "flex", flexDirection: "column", gap: "15px", borderRadius: "12px"}}>
                                <div className="theme-user">
                                    <p>ธีม</p>
                                    {themeOptions.map((e) => (
                                        <button 
                                            type="button"
                                            key={e.id}
                                            onClick={() => setTheme(e.value as 'system' | 'light' | 'dark')}
                                            className={theme === e.value ? 'active' : ''}>
                                                <div className="active-theme" />
                                                {e.theme}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="password-user">
                            { session?.user.provider == "credentials" && (
                                <span className="changepass-user" onClick={() => route.push('/user/forgot-password')}>เปลี่ยนรหัสผ่าน</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

interface DropdownProps {
        value: string | string[]
        onChange: (value: string) => void
        options: { value: string; label: string }[]
        dropdownKey: string
        multiSelect?: boolean
    }

export const CustomDropdown = ({ value, onChange, options, dropdownKey, multiSelect = false }: DropdownProps) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(dropdownRef, () => {
        setOpenDropdown(null)
    })

    const isOpen = openDropdown === dropdownKey
    const selectedValues = Array.isArray(value) ? value : [value].filter(Boolean)
    const selectedLabels = options.filter(opt => selectedValues.includes(opt.value)).map(opt => opt.label)

    const displayText = multiSelect 
        ? (selectedLabels.length === 0 ? "ทั้งหมด" : selectedLabels.join(", "))
        : (options.find(option => option.value === value)?.label || "ทั้งหมด")

    const handleCloseFilters = () => {
        onChange(options[0].value)
        setOpenDropdown(null)
    }

    return (
        <div className="custom-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
                className="dropdown-button">
                <span className={displayText === "ทั้งหมด" ? "" : "selectedOption"}>
                    {displayText}
                </span>
                { displayText === "ทั้งหมด" ? (
                    <ChevronDown
                        size={16}
                        style={{ 
                            fill: "var(--color-main)",
                            color: "var(--color-main)",
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }} 
                    />
                ) : (
                    <X 
                        className="close-filters"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleCloseFilters()
                        }}/>
                )}
            </button>
            
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value)
                                if (!multiSelect || option.value === "") {
                                    setOpenDropdown(null)
                                }
                            }}
                            className={`dropdown-item ${
                                multiSelect 
                                    ? (selectedValues.includes(option.value) ? 'select' : '')
                                    : (value === option.value ? 'select' : '')
                            }`}>
                                {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

interface EditDropdownProps<T extends string, V extends string | boolean | number> {
    value: string 
    options: { value: string; label: string }[]
    onChange: (field: T, value: V) => void
    dropdownKey: T
}

export const EditDropdown = <T extends string, V extends string | boolean | number> ({ value, options, onChange, dropdownKey } : EditDropdownProps<T, V>) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(dropdownRef, () => {
        setOpenDropdown(null)
    })

    const isOpen = openDropdown === dropdownKey

    let dataLabel = ""
    if (dropdownKey === "role") {
        const role = value
        switch (role) {
            case "admin":
                dataLabel = "Admin"
                break
            case "user":
                dataLabel = "User"
                break
            default:
                dataLabel = ""
        }
    } else if (dropdownKey === "verified") {
        const verified = value
        switch (verified) {
            case "true":
                dataLabel = "ยืนยัน"
                break
            case "false":
                dataLabel = "ไม่ยืนยัน"
                break
            default:
                dataLabel = ""
        }
    } else if (dropdownKey === "provider") {
        const verified = value
        switch (verified) {
            case "credentials":
                dataLabel = "Credentials"
                break
            case "google":
                dataLabel = "Google"
                break
            case "line":
                dataLabel = "Line"
                break
            default:
                dataLabel = ""
        }
    } else if (dropdownKey === "type") {
        dataLabel = value
    }


    return (
        <>
            <div className="input-select" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
                    className="select-button">
                        <span>{dataLabel}</span>
                        <ChevronDown
                            size={16}
                            style={{ 
                                fill: "var(--color-main)",
                                color: "var(--color-main)",
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }} 
                        />
                </button>

                {isOpen && (
                    <div className="select-menu">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(dropdownKey, option.value as V)
                                    setOpenDropdown(null)
                                }}
                                type="button"
                                className={`dropdown-item ${value === option.value ? 'select' : ''}`}>
                                    {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

interface DeleteTableProps {
    id: number | null
    onCancel: (id: number | null) => void
    onSubmit: (id: number | null) => void
}

export const DeleteTable = ({ id, onCancel, onSubmit } : DeleteTableProps) => {
    const deleteRef = useRef<HTMLDivElement | null>(null)
    useOnClickOutside(deleteRef, () => {
        onCancel(null)
    })

    return (
        <>
            <div className="delete-table-section" ref={deleteRef} onClick={(e) => e.stopPropagation()}>
                <p>ยืนยันการลบข้อมูล #ID {id}</p>
                <div className="delete-table-button">
                    <button 
                        type="button"
                        onClick={() => onCancel(null) }>
                            ยกเลิก</button>
                    <button 
                        type="button"
                        style={{ background: "var(--color-alert)", color: "var(--color-font-white)"}}
                        onClick={() => onSubmit(id)}>
                            ยืนยัน</button>
                </div>
            </div>
        </>
    )
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

interface EditProfileProps {
    editingRow: number | null
    activeEditingRow: (id: number | null) => void
    editForm: Partial<UserProps> | null
    activeSaveForm: (data: Partial<UserProps>) => void
    onSubmitDelete: (id: number | null) => void
}

export const EditProfile = ({ editingRow, activeEditingRow, editForm, activeSaveForm, onSubmitDelete }: EditProfileProps) => {
    const [form, setForm] = useState<Partial<UserProps>>({})

    useEffect(() => {
        if (!editForm) return
        setForm(editForm)
    }, [editForm])


    const handleChange = (field: keyof UserProps, value: string | boolean) => {
        if (field === "verified") {
            value = value === "true" ? true : false
        }
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const [deleteData, setDeleteData] = useState<number | null>(null)

    return (
        <>
            <div className={`edit-container ${ editingRow ? 'show' : '' }`}>
                <div className="edit-profile-bg">
                    <div className="edit-close">
                        <button 
                            type="button"
                            onClick={() => {
                                activeEditingRow(null)
                            }}>
                                <X size={18}/>
                        </button>
                    </div>
                    <Image src={form.image ? form.image : "/profile/profile-user.png"} alt="profile-user" width={70} height={70}/>
                    <p className="edit-id">#{form.id}</p>
                    <div className="delete-edit">
                        <button 
                            type="button"
                            className="delete-edit-button"
                            onClick={() => {
                                setDeleteData(editingRow)
                            }}>
                            <Trash2 size={14}/>ลบผู้ใช้งาน
                        </button>
                        { deleteData && (
                            <DeleteTable
                                id={deleteData}
                                onCancel={setDeleteData}
                                onSubmit={onSubmitDelete}/>
                        )}
                    </div>
                    <div className="edit-profile-name">
                        <span>Name</span>
                        <input
                            type="text"
                            value={form.name ?? ''}
                            onChange={(e) => handleChange("name", e.target.value)}
                            />
                    </div>
                    <div className="edit-profile-name">
                        <span>Email</span>
                        <input
                            type="text"
                            value={form.email ?? ''}
                            onChange={(e) => handleChange("email", e.target.value)}
                            />
                    </div>
                    <div className="edit-profile-detail">
                        <div className="edit-profile-role">
                            <span className="edit-profile-detail-span">Role</span>
                            <EditDropdown 
                                value={form.role ?? ""}
                                options={[
                                    { value: "admin", label: "Admin" },
                                    { value: "user", label: "User" }
                                ]}
                                onChange={handleChange}
                                dropdownKey="role"/>
                        </div>
                        <div className="edit-profile-verified">
                            <span className="edit-profile-detail-span">Verified</span>
                            <EditDropdown 
                                value={String(form.verified)}
                                options={[
                                    { value: "true", label: "ยืนยัน" },
                                    { value: "false", label: "ไม่ยืนยัน" }
                                ]}
                                onChange={handleChange}
                                dropdownKey="verified"/>
                        </div>
                    </div>
                    <div className="edit-profile-detail">
                        <div className="edit-profile-provider">
                            <span className="edit-profile-detail-span">Provider</span>
                            <EditDropdown 
                                value={form.provider ?? ""}
                                options={[
                                    { value: "credentials", label: "Credentials" },
                                    { value: "google", label: "Google" },
                                    { value: "line", label: "Line" }
                                ]}
                                onChange={handleChange}
                                dropdownKey="provider"/>
                        </div>
                    </div>
                    <div className="edit-save">
                        <button 
                            type="button"
                            className="edit-save-button"
                            onClick={() => {
                                activeSaveForm(form)
                            }}>
                            <Check size={18}/> บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </div>
            { editingRow && <div className="edit-profile-fade" />}
        </>
    )
}

interface ChatProps {
    id: number
    name: string
    count: number
    user: number
    updatedAt: string
    createdAt: string
}

interface EditChatsProps {
    editingRow: number | null
    activeEditingRow: (id: number | null) => void
    editForm: Partial<ChatProps> | null
    activeSaveForm: (data: Partial<ChatProps>) => void
    onSubmitDelete: (id: number | null) => void
}

export const EditChats = ({ editingRow, activeEditingRow, editForm, activeSaveForm, onSubmitDelete }: EditChatsProps) => {
    const [form, setForm] = useState<Partial<ChatProps>>({})

    useEffect(() => {
        if (!editForm) return
        setForm(editForm)
    }, [editForm])


    const handleChange = (field: keyof ChatProps, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const [deleteData, setDeleteData] = useState<number | null>(null)
    
    return (
        <>
            <div className={`edit-container ${ editingRow ? 'show' : '' }`}>
                <div className="edit-chat-bg">
                    <div className="edit-close">
                        <button 
                            type="button"
                            onClick={() => {
                                activeEditingRow(null)
                            }}>
                                <X size={18}/>
                        </button>
                    </div>
                    <p className="edit-id" style={{ textAlign: 'start', paddingTop: '20px' }}>#{form.id}</p>
                    <div className="delete-edit">
                        <button 
                            type="button"
                            className="delete-edit-button"
                            onClick={() => {
                                setDeleteData(editingRow)
                            }}>
                            <Trash2 size={14}/>ลบห้องสนทนา
                        </button>
                        { deleteData && (
                            <DeleteTable
                                id={deleteData}
                                onCancel={setDeleteData}
                                onSubmit={onSubmitDelete}/>
                        )}
                    </div>
                    <div className="edit-user-id">
                        <span>Name</span>
                        <input 
                            type="text"
                            value={form?.name ?? ''}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="edit-chat-name"/>
                    </div>
                    <div className="edit-user-id">
                        <span>User ID  #{editForm?.user}</span>
                        <input 
                            type="text"
                            value={form?.user ?? 0}
                            onChange={(e) => {
                                const value = e.target.value === '' ? 0 : 
                                /^[0-9]+$/.test(e.target.value) ? Number(e.target.value) : 0
                                handleChange("user", value)
                            }}
                            style={{ width: '20%' , textAlign: 'center'}}/>
                    </div>
                    <div className="edit-save">
                        <button 
                            type="button"
                            className="edit-save-button"
                            onClick={() => {
                                activeSaveForm(form)
                            }}>
                            <Check size={18}/> บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </div>
            { editingRow && <div className="edit-fade" />}
        </>
    )
}



interface FilesProps {
    id: number
    name: string
    detail: string
    type: string
    user: number
    updatedAt: string
    createdAt: string
}

interface EditFilesProps {
    editingRow: number | null
    activeEditingRow: (id: number | null) => void
    editForm: Partial<FilesProps> | null
    activeSaveForm: (data: Partial<FilesProps>) => void
    onSubmitDelete: (id: number | null) => void
}

export const EditFiles = ({ editingRow, activeEditingRow, editForm, activeSaveForm, onSubmitDelete }: EditFilesProps) => {
    const [form, setForm] = useState<Partial<FilesProps>>({})

    useEffect(() => {
        if (!editForm) return
        setForm(editForm)
    }, [editForm])


    const handleChange = (field: keyof FilesProps, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const [deleteData, setDeleteData] = useState<number | null>(null)

    return (
        <>
            <div className={`edit-container ${ editingRow ? 'show' : '' }`}>
                <div className="edit-chat-bg">
                    <div className="edit-close">
                        <button 
                            type="button"
                            onClick={() => {
                                activeEditingRow(null)
                            }}>
                                <X size={18}/>
                        </button>
                    </div>
                    <p className="edit-id" style={{ textAlign: 'start', paddingTop: '20px' }}>#{form.id}</p>
                    <div className="delete-edit">
                        <button 
                            type="button"
                            className="delete-edit-button"
                            onClick={() => {
                                setDeleteData(editingRow)
                            }}>
                            <Trash2 size={14}/>ลบเอกสาร
                        </button>
                        { deleteData && (
                            <DeleteTable
                                id={deleteData}
                                onCancel={setDeleteData}
                                onSubmit={onSubmitDelete}/>
                        )}
                    </div>
                    <div className="edit-profile-name">
                        <span>File name</span>
                        <input
                            type="text"
                            value={form.name ?? ''}
                            onChange={(e) => handleChange("name", e.target.value)}
                            />
                    </div>
                    <div className="edit-profile-name">
                        <span>Detail</span>
                        <textarea
                            rows={2}
                            value={form.detail ?? ''}
                            onChange={(e) => handleChange("detail", e.target.value)}
                            />
                    </div>
                    <div className="edit-profile-detail">
                        <div className="edit-profile-provider">
                            <span className="edit-profile-detail-span">Type</span>
                            <EditDropdown 
                                value={form.type ?? ''}
                                options={[
                                    { value: "csv", label: "csv" },
                                    { value: "docx", label: "docx" },
                                    { value: "pdf", label: "pdf" },
                                    { value: "txt", label: "txt" }
                                ]}
                                onChange={handleChange}
                                dropdownKey="type"/>
                        </div>
                    </div>
                    <div className="edit-save">
                        <button 
                            type="button"
                            className="edit-save-button"
                            onClick={() => {
                                activeSaveForm(form)
                            }}>
                            <Check size={18}/> บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </div>
            { editingRow && <div className="edit-fade" />}
        </>
    )
}