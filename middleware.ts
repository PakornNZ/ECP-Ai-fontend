import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (pathname.startsWith('/chats/')) {
        return NextResponse.rewrite(new URL('/', request.url))
    }

    if (pathname.startsWith('/sign_in') && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/email_verification') && token) {
        return NextResponse.redirect(new URL('/sign_in', request.url))
    }

    if (pathname.startsWith('/forgot_password') && token && token.provider !== 'credentials') {
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
        '/sign_in:path*',
        '/email_verification:path*',
        '/forgot_password:path*',
        '/dashboard:path*',
        '/:path*',
    ],
}