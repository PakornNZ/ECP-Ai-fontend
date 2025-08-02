"use client"

import axios from "axios";
import Image from "next/image";
import "@/app/styles/style-Login.css"
import { ArrowRight, X, Eye, EyeClosed, UserRound, KeyRound, Undo2, AtSign } from 'lucide-react';
import GoogleLogo from "@/public/logo/google-brands.svg"
import LineLogo from "@/public/logo/line-brands.svg"
import LogoWhite from "@/public/logo/logo-white.svg"
import Logo from "@/public/logo/logo-png.png"
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loading, ArlertEmail, Arlert } from "@/app/components/object/object"
import { encryptURL } from "@/utils/crypto"
import { signIn, useSession } from "next-auth/react"
import LoadingFull from "@/app/components/dashboard/LoadingFull"


function SingIn() {
    const router = useRouter()

    const forgetPassword = async () => {
        const domain = lgEmail.split('@')[1] || ""
        if (domain != "rmuti.ac.th") return

        try {
            const res = await axios.post('/api/auth/forgot_password', { lgEmail })
            const resData = res.data

            if (resData.status === 1) {
                setArlertMessage({
                    color: true,
                    message: resData.message
                })
                const timeOutAPI = setTimeout(() => {
                    setArlertMessage({
                        color: true,
                        message: ""
                    })
                }, 6000)
                return () => clearTimeout(timeOutAPI)
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

    const { data: session } = useSession()
    useEffect(() => {
        if(session) {
            router.push("/")
        }
    }, [session, router])


    const [showPassword, setShowPassword] = useState(false)
    const handleShowPassword = () => {
        setShowPassword(prev => !prev)
    }
    
    const [nextState, setNextState] = useState(false)
    // const handleNext = async () => {
    //     setLgEmailState(false)
    //     try {
    //         const res = await axios.post('/api/auth/sign_in/check_email', { lgEmail })
    //         const resData = res.data
    //         if (resData.status === 1) {
    //             setNextState(true)
    //         }
    //     } catch (error: unknown) {
    //         setNextState(false)
    //         if (!axios.isAxiosError(error)) return
    //         const errorMessage = error.response?.data?.message
    //         setArlertMessage({
    //             color: false,
    //             message: errorMessage
    //         })
    //         const timeOutAPI = setTimeout(() => {
    //             setArlertMessage({
    //                 color: false,
    //                 message: ""
    //             })
    //         }, 6000)
    //         return () => clearTimeout(timeOutAPI)
    //     } finally {
    //         const timeOutBT = setTimeout(() => {
    //             setLgEmailState(true)
    //         }, 2000)
    //         return () => clearTimeout(timeOutBT)
    //     }
    // }
    
    const [registerState, setRegisterState] = useState(false)
    const handleRegister = () => {
        setRegisterState(prev => !prev)
        // if (nextState) {
        //     handleNext()
        // }
        if (showPassword) {
            handleShowPassword()
        }
        ResetState()
    }

            // * ข้อความแจ้งเตือน
            const [arlertMessage, setArlertMessage] = useState({
                color: true,
                message: ""
            })

                    const [submitUser, setSubmitUser] = useState<boolean>(false)
                    const submitLogin = async () => {
                        if (!nextState) return
                        setSubmitUser(true)
                        const payload = {
                            email: lgEmail,
                            password: lgPass
                        }

                        try {
                            const res = await signIn("credentials", {
                                ...payload,
                                redirect: false
                            })
                            
                            if (res?.error) {
                                const errorData = JSON.parse(res.error)
                                setArlertMessage({
                                    color: false,
                                    message: errorData?.message
                                })
                                const timeOutAPI = setTimeout(() => {
                                    setArlertMessage({
                                        color: false,
                                        message: ""
                                    })
                                }, 6000)
                                return () => clearTimeout(timeOutAPI)
                            } else {
                                router.push('/')
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
                        } finally {
                            setSubmitUser(false)
                            const timeOutBT = setTimeout(() => {
                                setSubmitNewUser(false)
                            }, 2000)
                            return () => clearTimeout(timeOutBT)
                        }
                    }

                    const [submitNewUser, setSubmitNewUser] = useState<boolean>(false)
                    const submitRegister = async () => {
                        setSubmitNewUser(true)

                        if (rsPass != rsPassCheck) {
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
                            setAllowRegister(false)
                            setSubmitNewUser(false)
                            return () => clearTimeout(timeOut)
                        } else {
                            try {
                                const payload = {
                                    username: `${firstName} ${lastName}`,
                                    email: rsEmail,
                                    password: rsPass
                                }
                                
                                const res = await axios.post('/api/auth/sign_up', payload)
                                const resData = res.data
                                
                                if (resData.status === 1) {
                                    const encodeURL = encodeURIComponent(await encryptURL(`email=${payload.email}`))
                                    router.push(`/email_verification?data=${encodeURL}`)
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
                            } finally {
                                const timeOutBT = setTimeout(() => {
                                    setSubmitNewUser(false)
                                }, 2000)
                                return () => clearTimeout(timeOutBT)
                            }
                        }
                    }

                    const [AllowAccount, setAllowAccount] = useState<boolean>(false)
                    const LoginGoogle = async () => {
                        setAllowAccount(true)
                        try {
                            await signIn("google", { redirect: false })
                        } catch {
                            setAllowAccount(false)
                        }
                    }

                    const LoginLine = async () => {
                        setAllowAccount(true)
                        try {
                            await signIn("line", { redirect: false })
                        } catch {
                            setAllowAccount(false)
                        }
                    }

                    const searchParams = useSearchParams()
                    useEffect(() => {
                        const getURL = searchParams.get("error") || ""
                        const messageError = (decodeURIComponent(getURL))
                        if(messageError == "") return
                        
                        const messageErr = JSON.parse(messageError)
                        setArlertMessage({
                            color: false,
                            message: messageErr.message
                        })
                        const timeOutAPI = setTimeout(() => {
                            setArlertMessage({
                                color: false,
                                message: ""
                            })
                        }, 6000)
                        return () => clearTimeout(timeOutAPI)
                    }, [searchParams])

                    
                        const [arlertEmail, setArlertEmail] = useState<string>("")
                        
                        // * login
                        const [allowLogin, setAllowLogin] = useState<boolean>(false)

                            const [lgEmail, setLgEmail] = useState<string>("")
                            const [lgEmailState, setLgEmailState] = useState<boolean>(false)
                                const emailLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setLgEmail(value)

                                    const parts = value.split('@')
                                    const domain = parts[1] || ""
                                    if (domain == "rmuti.ac.th") {
                                        setArlertEmail("")
                                        setLgEmailState(true)
                                    } else {
                                        setLgEmailState(false)
                                        setNextState(false)
                                    }
                                }

                                const reCheckDomainLg = () => {
                                    if (lgEmail == "") {
                                        setArlertEmail("") 
                                        setLgEmailState(false)
                                        setNextState(false)
                                        return
                                    }

                                    const parts = lgEmail.split('@')
                                    const domain = parts[1] || ""
                                    if (!domain) {
                                        setArlertEmail("")
                                        setLgEmailState(false)
                                        setNextState(false)
                                        return
                                    }

                                    if (domain != "rmuti.ac.th") {
                                        setArlertEmail("rmuti.ac.th เท่านั้น")
                                    }
                                }

                                const [lgPass, setLgPass] = useState<string>("")
                                const passwordLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setLgPass(value)
                                }

                            useEffect(() => {
                                if (nextState && lgPass != "") {
                                    setAllowLogin(true)
                                }
                            }, [nextState, lgPass])
                        
                        // * Register
                        const [allowRegister, setAllowRegister] = useState<boolean>(false)

                            const [firstName, setFirstName] = useState<string>("")
                                const firstNameRegister  = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setFirstName(value)
                                }
                            
                            const [lastName, setLastName] = useState<string>("")
                                const lastNameRegister  = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setLastName(value)
                                }

                            const [rsEmail, setRsEmail] = useState<string>("")
                            const [rsEmailState, setRsEmailState] = useState<boolean>(false)
                                const emailRegister = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setRsEmail(value)

                                    const parts = value.split('@')
                                    const domain = parts[1] || ""
                                    if (domain == "rmuti.ac.th") {
                                        setArlertEmail("")
                                        setLgEmailState(true)
                                    } else {
                                        setLgEmailState(false)
                                        setNextState(false)
                                    }
                                }

                                const reCheckDomain = () => {
                                    if (rsEmail == "") {
                                        setArlertEmail("") 
                                        setRsEmailState(false)
                                        return 
                                    }

                                    const parts = rsEmail.split('@')
                                    const domain = parts[1] || ""
                                    if (!domain) {
                                        setArlertEmail("") 
                                        setRsEmailState(false)
                                        return 
                                    }
                                    
                                    if (domain != "rmuti.ac.th") {
                                        setArlertEmail("rmuti.ac.th เท่านั้น")
                                        setRsEmailState(false)
                                    } else {
                                        setArlertEmail("")
                                        setRsEmailState(true)
                                    }
                                }


                            const [rsPass, setRsPass] = useState<string>("")
                            const [rsPassLenght, setRsPassLenght] = useState<boolean>(false)
                            const [rsPassChar, setRsPassChar] = useState<boolean>(false)
                                const passwordRegister = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setRsPass(value)

                                    const checkChar = (value.match(/[^\d]/g) || [])
                                    setRsPassLenght(value.length >= 8)
                                    setRsPassChar(checkChar.length >= 4)
                                }


                            const [rsPassCheck, setRsPassCheck] = useState<string>("")
                                const passwordRegisterReCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/\s/g, "")
                                    setRsPassCheck(value)
                                }

                            useEffect(() => {
                                if (rsEmailState && rsPassLenght && rsPassChar && rsPassCheck != "" && firstName != "" && lastName != "") {
                                    setAllowRegister(true)
                                } else {
                                    setAllowRegister(false)
                                }
                            }, [rsEmailState, rsPassLenght, rsPassChar, rsPassCheck, firstName, lastName])
                    
                    // * Reset ทุกค่า 
                    const ResetState = () => {
                        setNextState(false)
                        
                        setArlertEmail("")
                        setLgEmail("")
                        setLgEmailState(false)
                        setLgPass("")

                        setFirstName("")
                        setLastName("")
                        setRsEmail("")
                        setRsEmailState(false)
                        setRsPass("")
                        setRsPassLenght(false)
                        setRsPassChar(false)
                        setRsPassCheck("")
                    }

                    const ReEmail = () => {
                        setRsEmail("")
                        setLgEmail("")
                    }

    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <div className="section-ps">
                <div className="section-bg">
                    <div className="section-logo">
                        { Logo && <Image src={Logo} alt="logo-website" width={180} height={180}/>}
                        <h1>ECP Ai</h1>
                    </div>
                    <div className={`section-data ${registerState ? "register" : ""}`}>
                        <div className="form-container">

                            {/* ฟอร์ม Login */}
                            <div className="section-signin">
                                <h1>ลงชื่อใช้งาน</h1>
                                <div className={`form-data ${nextState ? "next" : ""}`}>
                                    <p><AtSign />อีเมล</p>
                                    <div className="input-container">
                                        <input type="text" 
                                            maxLength={40} 
                                            placeholder="กรอกอีเมล" 
                                            value={lgEmail}
                                            onChange={emailLogin}
                                            onBlur={reCheckDomainLg}/>
                                        <button 
                                            tabIndex={0} 
                                            right-title="ล้างอีเมล" 
                                            onClick={ReEmail}>
                                                <X />
                                        </button>
                                        <ArlertEmail messageArlert={arlertEmail} />
                                    </div>
                                    <p><KeyRound />รหัสผ่าน</p>
                                    <div className="input-container">
                                        <input
                                            disabled={!nextState} 
                                            type={showPassword ? "text" : "password"}  
                                            maxLength={40} 
                                            placeholder="กรอกรหัสผ่าน"
                                            value={lgPass}
                                            onChange={passwordLogin}/> 
                                        <button right-title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                                            { showPassword ? <Eye onMouseDown={handleShowPassword}/> : <EyeClosed onMouseDown={handleShowPassword}/> }
                                        </button>
                                    </div>
                                    <span className="forgot-password" onClick={forgetPassword}>ลืมรหัสผ่าน ?</span>
                                </div>
                                <button
                                    disabled={ nextState ? submitUser || !allowLogin : !lgEmailState} 
                                    className={`form-bt ${ nextState ? "submit" : ""}`} 
                                    type="button" 
                                    onClick={ !nextState ? () => setNextState(true)  : submitLogin }>
                                        { !nextState ? <><span>ถัดไป</span><ArrowRight /></> : <>{ submitUser ? <Loading/> : "เข้าสู่ระบบ" }</> }
                                </button>
                                <div className="register-footer">
                                    <span>ยังไม่มีบัญชี ?</span><span className="register-bt" onClick={handleRegister} >ลงทะเบียน</span>
                                </div>
                                <div className="select-login">
                                    <hr />
                                    <span>หรือ</span>
                                    <hr />
                                </div>
                                <div className="section-login-bt">
                                    <button className="google-bt" type="button"
                                        disabled={AllowAccount}
                                        onClick={LoginGoogle}>
                                            { GoogleLogo && 
                                                <>
                                                    <Image src={GoogleLogo} alt="google-logo" width={20} height={20}/>ลงชื่อเข้าใช้ด้วย Google
                                                </>
                                            }
                                    </button>
                                    <button className="line-bt" type="button"
                                        disabled={AllowAccount}
                                        onClick={LoginLine}>
                                        { LineLogo &&
                                            <>
                                                <Image src={LineLogo} alt="line-logo" width={20} height={20}/>ลงชื่อเข้าใช้ด้วย Line
                                            </>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* ฟอร์ม Register */}
                            <div className="section-signup">
                                <button className="undo-section" type="button" onClick={handleRegister} left-title="ย้อนกลับ" ><Undo2 /></button>
                                <h1>ลงทะเบียน</h1>
                                <div className="form-data-rg">
                                    <p><UserRound />ชื่อผู้ใช้งาน</p>
                                    <div className="input-container" style={{ gap: "5px" }}>
                                        <input type="text" 
                                            maxLength={20} 
                                            placeholder="กรอกชื่อ" 
                                            value={firstName}
                                            onChange={firstNameRegister}
                                            style={{ width: "50%", padding: "8px 10px" }}/>
                                        <input type="text" 
                                            maxLength={20} 
                                            placeholder="กรอกนามสกุล" 
                                            value={lastName}
                                            onChange={lastNameRegister}
                                            style={{ width: "50%", padding: "8px 10px" }}/>
                                    </div>
                                    <p><AtSign />อีเมล</p>
                                    <div className="input-container">
                                        <input type="text" 
                                            disabled={submitNewUser}
                                            maxLength={40} 
                                            value={rsEmail} 
                                            onChange={emailRegister} 
                                            onBlur={reCheckDomain}
                                            placeholder="ที่อยู่อีเมล @rmuti.ac.th" />
                                        <button tabIndex={0}  right-title="ล้างอีเมล" onClick={ReEmail}><X /></button>
                                        <ArlertEmail messageArlert={arlertEmail} />
                                    </div>
                                    <p><KeyRound />รหัสผ่าน</p>
                                    <div className="input-ps">
                                        <div className="input-container">
                                            <input type={showPassword ? "text" : "password"} 
                                                disabled={submitNewUser}
                                                maxLength={40} 
                                                placeholder="กรอกรหัสผ่าน" 
                                                value={rsPass}
                                                onChange={passwordRegister}/> 
                                            <button tabIndex={0}  right-title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                                                { showPassword ? <Eye onMouseDown={handleShowPassword}/> : <EyeClosed onMouseDown={handleShowPassword}/> }
                                            </button>
                                        </div>
                                        <h5><KeyRound />ยืนยันรหัสผ่าน</h5>
                                        <input className="input-check" 
                                            disabled={submitNewUser}
                                            type="password"  
                                            maxLength={40} 
                                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                                            value={rsPassCheck}
                                            onChange={passwordRegisterReCheck}/> 
                                        <div className="recheck-ps">
                                            <span 
                                                style={{ color: `${ rsPassChar ? "var(--color-main)" : "var(--color-font-fade)" }`}}>
                                                    * ตัวอักษร 4 ตัว
                                            </span>
                                            <span
                                                style={{ color: `${ rsPassLenght ? "var(--color-main)" : "var(--color-font-fade)" }`}}>
                                                    * ความยาวไม่น้อยกว่า 8 ตัว
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button disabled={submitNewUser || !allowRegister} className={`submit-register ${registerState ? "active" : ""}`} type="button" onClick={submitRegister}>
                                    { submitNewUser ? <Loading/> : "ลงทะเบียน" }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                { LogoWhite && <Image src={LogoWhite} alt="logo-white" className="backdrop-logo" width={900} height={900}/>}
            </div>
        </>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingFull />}>
            <SingIn />
        </Suspense>
    )
}