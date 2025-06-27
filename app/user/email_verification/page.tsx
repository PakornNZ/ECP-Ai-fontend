"use client"

import Image from "next/image";
import LogoWhite from "@/public/logo/logo-white.svg"
import Logo from "@/public/logo/logo-png.png"
import "@/app/styles/style-Verification.css"
import { RotateCw } from 'lucide-react';
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Arlert } from "@/app/components/object/object"
import axios from "axios";
import { decryptURL } from "@/utils/crypto"
import { useSession } from "next-auth/react"
import Loading from "@/app/components/dashboard/LoadingFull";

function Verification() {
    const router = useRouter()
    const [allowSend, setAllowSend] = useState<boolean>(false)
    const [timer, setTimer] = useState<number>(60)

    useEffect(() => {
        if (timer <= 0) return setAllowSend(true)

        const time = setInterval(() => {
            setTimer(prev => prev - 1)
        }, 1000)

        return () => clearInterval(time)
    }, [timer])

    useEffect(() => {
        if (timer > 0) return setAllowSend(false)
    }, [allowSend, timer])

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60).toString().padStart(2, "0")
        const sec = (seconds % 60).toString().padStart(2, "0")
        return `${min}:${sec}`
    }


    const searchParams = useSearchParams()
    const [token, setToken] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    useEffect(() => {
        const encoded = searchParams.get("data")
    
        if (encoded) {
            setAllowSend(false)
            const decrypted = decodeURIComponent(encoded)
            decryptURL(decrypted).then((decodeURL) => {
                if (!decodeURL) return

                const params = new URLSearchParams(decodeURL)
                setToken(params.get("token") || "")
                setEmail(params.get("email") || "")
            })
        }
    }, [searchParams])

    useEffect (() => {
        const sendEmail = async () => {
            try {
                const res = await axios.put('/api/auth/email_verification', {token})
                const resData = res.data
                if (resData.status === 1) {
                    setTimeout(() => {
                        router.push('/user/login-ecp_ai')
                    }, 2000)
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
        if (token == "") return
        sendEmail()

    }, [token, router])

    const { data: session } = useSession()
    useEffect(() => {
        if (session) {
            router.push('/user/login-ecp_ai')
        }
    }, [session, router])

            // * ข้อความแจ้งเตือน
            const [arlertMessage, setArlertMessage] = useState({
                color: true,
                message: ""
            })


            const sendEmailAgain = async () => {
                if (email == "") return

                setAllowSend(false)
                try {
                    const res = await axios.put('/api/auth/email_verification/resend', {email})
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
                    if (error.response?.data?.status === 2) {
                        setArlertMessage({
                            color: false,
                            message: errorMessage
                        })
                        setTimeout(() => {
                            router.push('/user/login-ecp_ai')
                        }, 1500)
                    } else {
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
                } finally {
                    const timeOut = setTimeout(() => {
                        setTimer(60)
                    }, 2000)
                    return () => clearTimeout(timeOut)
                }
            }


    return (
        <>
            <Arlert messageArlert={arlertMessage} />
            <div className="section-veri">
                <div className="section-logo-veri">
                    { Logo && <Image src={Logo} alt="logo" className="logo-web" priority width={50} height={50}/>}
                    <h1>ECP Ai</h1>
                </div>
                <div className="veri-bg">
                    <h1>ยืนยันตัวตน</h1>
                    <p>เราได้ส่งจดหมายเพื่อยืนยันตัวตนไปยัง {email}</p>
                    <p>หากยังไม่ได้รับจดหมาย หรือเกิดข้อผิดพลาดคุณสามารถส่งจดหมายได้อีกครั้ง</p>
                    <div className="veri-bt">
                        <span>จะส่งได้อีกครั้งในอีก {formatTime(timer)}</span>
                        <button type="button"
                            disabled={!allowSend}
                            onClick={sendEmailAgain}><RotateCw /> ส่งอีกครั้ง</button>
                    </div>
                </div>
                { LogoWhite && <Image src={LogoWhite} alt="logo-white" className="backdrop-logo" width={900} height={900}/>}
            </div>
        </>
    )
}

export default function VerificationPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Verification />
        </Suspense>
    )
}