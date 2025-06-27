import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.PRIVATE_API_CHAT
export async function POST(req: NextRequest) {

    const { querySend } = await req.json()
    const message = querySend

    try {
        const res = await axios.post(`${API}/chat/guest_response`, { message } )

        return NextResponse.json(res.data)
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