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
    try {
        const res = await axios.post(`${API}/dashboard/profile-chat`, payload, {
            headers: {
                Authorization: 'Bearer ' + jwtToken
            }
        })

        return NextResponse.json(res.data)
    } catch (error: unknown) {
        let message = ''
        let statusCode = 500
        if (axios.isAxiosError(error) && error.response) {
            message = error.response.data?.message || message
            statusCode = error.response.status || statusCode
        }

        return NextResponse.json({
            status: 0,
            message,
            data: {}
        }, { status: statusCode })
    }
}