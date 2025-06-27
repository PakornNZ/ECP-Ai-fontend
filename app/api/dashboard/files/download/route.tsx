import axios from "axios";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.PRIVATE_API_DASHBOARD
const secret = process.env.NEXTAUTH_SECRET
export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret })
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!secret) return
    const tokenPayload = { id: token.id, email_verified: token.email_verified }
    const jwtToken = jwt.sign(tokenPayload, secret, { algorithm: 'HS256', expiresIn: '1m' })
    
    const payload = await req.json()
    const id = payload.id
    try {
        const res = await axios.post(`${API}/dashboard/download_file`, {id}, {
            headers: {
                Authorization: 'Bearer ' + jwtToken
            },
            responseType: 'arraybuffer'
        })
        const disposition = res.headers['content-disposition']
        const file_match = disposition?.match(/filename\*=UTF-8''?(.+)?/)
        const file_name = decodeURIComponent(file_match?.[1])

        return new NextResponse(Buffer.from(res.data), {
            status: 200,
            headers: {
                "Content-Type": res.headers['content-type'],
                "Content-Disposition": `attachment; filename=${encodeURIComponent(file_name)}`,
                "Access-Control-Expose-Headers": "Content-Disposition",
            }
        })
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