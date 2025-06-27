import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.PRIVATE_API_AUTH
export async function PUT(req: NextRequest) {
    const { token } = await req.json()
    try {
        const emailVerificationToken = token
        const res = await axios.put(`${API}/email_verification`, {emailVerificationToken})
        const resData = res.data

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