import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (pathname.startsWith('/chats/')) {
        return NextResponse.rewrite(new URL('/', request.url))
    }

    if (pathname.startsWith('/user/login-ecp_ai') && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/user/email_verification') && token) {
        return NextResponse.redirect(new URL('/user/login-ecp_ai', request.url))
    }

    if (pathname.startsWith('/user/forgot-password') && token && token.provider !== 'credentials') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/dashboard') && (token?.role != 2)) {
        return NextResponse.redirect(new URL('/', request.url))
    }


    return NextResponse.next()
}


export const config = {
    matcher: [
        '/chats/:path*',
        '/user/login-ecp_ai:path*',
        '/user/email_verification:path*',
        '/user/forgot-password:path*',
        '/dashboard:path*',
        '/:path*',
    ],
}