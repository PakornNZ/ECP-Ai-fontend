"use client"

import Image from "next/image";
import "@/app/styles/style-ForgetPS.css"
import { Suspense, useEffect, useState } from "react"
import { Eye, EyeClosed } from 'lucide-react';
import LogoWhite from "@/public/logo/logo-white.svg"
import Logo from "@/public/logo/logo-png.png"
import { Loading, Arlert } from "@/app/components/object/object"
import { decryptURL } from "@/utils/crypto"
import { useSession, signOut } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import LoadingFull from "@/app/components/dashboard/LoadingFull"

function ForgetPassword() {

    const router = useRouter()
    
    // * ข้อความแจ้งเตือน
    const [arlertMessage, setArlertMessage] = useState({
        color: true,
        message: ""
    })

    const [pattern, setPattern] = useState<boolean | null>(null)

    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const [token, setToken] = useState<string>("")
    useEffect(() => {
        const encoded = searchParams.get("data")
    
        if (encoded) {
            const decrypted = decodeURIComponent(encoded)
            decryptURL(decrypted).then((decodeURL) => {
                if (!decodeURL) return

                const params = new URLSearchParams(decodeURL)
                setToken(params.get("token") || "")
            })
        }
    }, [searchParams])
    
    
    useEffect(() => {
        if (typeof session === "undefined") return
        
        // if (session?.user.provider != "credentials") {
        //     router.push('/')
        // }

        if (session && token == "") {
            setPattern(false)
        } else if (!session && token != "") {
            setPattern(true)
        } else if ((session && token !== "") || (!session && token === "")) {
            router.push('/user/login-ecp_ai')
        }
    }, [session, token, router])


        useEffect(() => {
            if (token == ""  || session) return
            const check_passwordToken = async () => {
                try {
                    await axios.post('/api/auth/forgot_password/check_password', { token })
                } catch (error: unknown) {
                    if (!axios.isAxiosError(error)) return
                    const errorMessage = error.response?.data?.message
                    console.log(errorMessage)
                    setArlertMessage({
                        color: false,
                        message: errorMessage
                    })
                    const timeOutAPI = setTimeout(() => {
                        router.push('/user/login-ecp_ai')
                    }, 3000)
                    return () => clearTimeout(timeOutAPI)
                }
            }
            check_passwordToken()
        }, [token, router, session])


    const [showPasswordPresent, setShowPasswordPresent] = useState<boolean>(false)
    const handleShowPasswordPresent = () => {
        setShowPasswordPresent( (prev) => !prev )
    }
    const [showPasswordNew, setShowPasswordNew] = useState<boolean>(false)
    const handleShowPasswordNew = () => {
        setShowPasswordNew( (prev) => !prev )
    }


                    const [savePassword, setSavePassword] = useState<boolean>(false)
                    const submitPassword = async () => {
                        if (session) return
                        setSavePassword(true)

                        if (password != passwordCheck) {
                            setArlertMessage({
                                color: false,
                                message: "รหัสผ่านไม่ตรงกัน"
                            })

                            const timeOut = setTimeout(() => {
                                setArlertMessage({
                                    color: false,
                                    message: ""
                                })
                            }, 6000)
                            setAllowPassword(false)
                            setSavePassword(false)
                            return () => clearTimeout(timeOut)
                        } else {
                            const payload = {
                                updatePasswordToken: token,
                                password: password
                            }

                            try {
                                const res = await axios.put('/api/auth/forgot_password/update_password', payload)
                                const resData = res.data

                                if (resData.status === 1){
                                    setArlertMessage({
                                        color: true,
                                        message: resData.message
                                    })
                                    const timeOutBT = setTimeout(() => {
                                        router.push('/user/login-ecp_ai')
                                    }, 3000)
                                    return () => clearTimeout(timeOutBT)
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
                                setAllowPassword(false)
                                setSavePassword(false)
                                return () => clearTimeout(timeOutAPI)
                            }
                        }
                    }


                    const sumbitChangePassword = async () => {
                        if (!session) return
                        setSavePassword(true)

                        if (password != passwordCheck) {
                            setArlertMessage({
                                color: false,
                                message: "รหัสผ่านใหม่ไม่ตรงกัน"
                            })

                            const timeOut = setTimeout(() => {
                                setArlertMessage({
                                    color: false,
                                    message: ""
                                })
                            }, 6000)
                            setAllowPassword(false)
                            setSavePassword(false)
                            return () => clearTimeout(timeOut)
                        } else {
                            const payload = {
                                email: session?.user.email,
                                password: currentPassword,
                                newpassword: password
                            }

                            try {
                                const res = await axios.put('/api/auth/forgot_password/change_password', payload)
                                const resData = res.data

                                if (resData.status === 1){
                                    setArlertMessage({
                                        color: true,
                                        message: resData.message
                                    })
                                    setTimeout( async () => {
                                        await signOut({
                                            redirect: true,
                                            callbackUrl: "/user/login-ecp_ai"
                                        })
                                    }, 3000)
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
                                setAllowPassword(false)
                                setSavePassword(false)
                                return () => clearTimeout(timeOutAPI)
                            }
                        }
                    }



                    const [password, setPassword] = useState<string>("")
                    const [passwordLenght, setPasswordLenght] = useState<boolean>(false)
                    const [passwordChar, setPasswordChar] = useState<boolean>(false)
                        const passwordNew = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value.replace(/\s/g, "")
                            setPassword(value)

                            const checkChar = (value.match(/[^\d]/g) || [])
                            setPasswordLenght(value.length >= 8)
                            setPasswordChar(checkChar.length >= 4)
                        }


                    const [passwordCheck, setPasswordCheck] = useState<string>("")
                        const passwordNewReCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value.replace(/\s/g, "")
                            setPasswordCheck(value)
                        }
                        
                    
                        
                    const [currentPassword, setCurrentPassword] = useState<string>("")
                    const passwordCurrent = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value.replace(/\s/g, "")
                        setCurrentPassword(value)
                    }   


                    const [allowPassword, setAllowPassword] = useState(false)
                    useEffect(() => {
                        if (pattern) {
                            if (password != "" && passwordLenght && passwordChar && passwordCheck != "") {
                                setAllowPassword(true)
                            } else {
                                setAllowPassword(false)
                            }
                        } else {
                            if (password != "" && passwordLenght && passwordChar && passwordCheck != "" && currentPassword != "") {
                                setAllowPassword(true)
                            } else {
                                setAllowPassword(false)
                            }
                        }
                    }, [password, passwordLenght, passwordChar, passwordCheck, currentPassword, pattern])




    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <div className="section-forget">
                <div className="section-logo-forget">
                    { Logo && <Image src={Logo} alt="logo" className="logo-web" priority width={50} height={50}/>}
                    <h1>ECP Ai</h1>
                </div>
                { pattern != null ? (
                    <div className="forget-bg">
                        <h1>เปลี่ยนรหัสผ่าน</h1>
                        { !pattern && (
                            <>
                                <div className="current-pass ">
                                    <p>รหัสผ่านปัจจุบัน</p>
                                    <div className="input-container">
                                        <input 
                                            type={showPasswordPresent ? "text" : "password"}  
                                            maxLength={40} placeholder="กรอกรหัสผ่าน"
                                            onChange={passwordCurrent}
                                            value={currentPassword}/> 
                                        <button tabIndex={0}  right-title={showPasswordPresent ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                                            { showPasswordPresent ? <Eye onMouseDown={handleShowPasswordPresent}/> : <EyeClosed onMouseDown={handleShowPasswordPresent}/> }
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        <p>รหัสผ่านใหม่</p>
                        <div className="input-container">
                            <input 
                                type={showPasswordNew ? "text" : "password"}  
                                maxLength={40} 
                                placeholder="กรอกรหัสผ่าน"
                                onChange={passwordNew}
                                value={password}/> 
                            <button tabIndex={0}  right-title={showPasswordNew ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                                { showPasswordNew ? <Eye onMouseDown={handleShowPasswordNew}/> : <EyeClosed onMouseDown={handleShowPasswordNew}/> }
                            </button>
                        </div>
                        <p>ยืนยันรหัสผ่านใหม่</p>
                        <div className="input-container">
                            <input type="password" 
                                maxLength={40} 
                                placeholder="กรอกรหัสผ่านอีกครั้ง"
                                onChange={passwordNewReCheck}
                                value={passwordCheck}/>
                            <div className="recheck-ps">
                                <span 
                                    style={{ color: `${ passwordChar ? "var(--color-main)" : "var(--color-font-fade)" }`}}>
                                        * ตัวอักษร 4 ตัว
                                </span>
                                <span
                                    style={{ color: `${ passwordLenght ? "var(--color-main)" : "var(--color-font-fade)" }`}}>
                                        * ความยาวไม่น้อยกว่า 8 ตัว
                                </span>
                            </div>
                        </div>
                        <button type="button" className="save-password-bt" 
                            disabled={!allowPassword || savePassword}
                            onClick={ pattern ? submitPassword : sumbitChangePassword} >
                                { savePassword ? <Loading/> : "บันทึกรหัสผ่าน" }
                        </button>
                    </div>
                ) : (
                    <div className="forget-bg" style={{ width: "300px", height: "380px"}}/>
                )}
                { LogoWhite && <Image src={LogoWhite} alt="logo-white" className="backdrop-logo" width={900} height={900}/>}
            </div>
        </>
    )
}


export default function ForgetPasswordPage() {
    return (
        <Suspense fallback={<LoadingFull />}>
            <ForgetPassword />
        </Suspense>
    )
}