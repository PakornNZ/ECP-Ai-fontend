import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Resend } from "resend";
import UpdatePasswordEmailTemplate from "@/app/components/email/ForgotPassword";
import { encryptURL } from "@/utils/crypto";

const API = process.env.PRIVATE_API_AUTH
const RESEND = process.env.RESEND_API_KEY
const WEBSITE = process.env.NEXTAUTH_URL
export async function POST(req: NextRequest) {
    const resend = new Resend(RESEND)
    const { lgEmail } = await req.json()
    try {
        const email = lgEmail
        const res = await axios.post(`${API}/forgot_password`, { email })
        const resData = res.data
        
        const encodeURL = encodeURIComponent(await encryptURL(`token=${resData.data.token}`))
        const updatePasswordLink = `${WEBSITE}/forgot_password?data=${encodeURL}`

        await resend.emails.send({
            from: "ECP Ai",
            to: email,
            subject: "เปลี่ยนรหัสผ่านเว็บไซต์ ECP Ai",
            react: UpdatePasswordEmailTemplate({ updatePasswordLink: updatePasswordLink })
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