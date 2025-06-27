import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import EmailVerificationEmailTemplate from "@/app/components/email/Verification";
import { encryptURL } from "@/utils/crypto"

const API = process.env.PRIVATE_API_AUTH
const RESEND = process.env.RESEND_API_KEY
const WEBSITE = process.env.NEXTAUTH_URL
const resend = new Resend(RESEND)
export async function PUT(req: NextRequest) {
    const { email } = await req.json()
    try {
        const res = await axios.put(`${API}/sign_up/resend_email`, {email})
        const resData = res.data

        const encodeURL = encodeURIComponent(await encryptURL(`token=${resData.data.token}&email=${email}`))
        const emailVerificationLink = `${WEBSITE}/user/email_verification?data=${encodeURL}`

        await resend.emails.send({
                    from: 'ECP Ai <onboarding@resend.dev>',
                    to: email,
                    subject: "ยืนยันการลงทะเบียนเว็บไซต์ ECP Ai",
                    react: EmailVerificationEmailTemplate({ emailVerificationLink: emailVerificationLink })
        })

        return NextResponse.json(resData, { status: 200 })
    } catch (error: unknown) {
        let message = 'Internal Server Error'
        let statusCode = 500
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || message
            statusCode = error.response?.status || 500
        }
        return NextResponse.json({
            status: 0,
            message,
            data: {}
        }, { status: statusCode })
    }
}