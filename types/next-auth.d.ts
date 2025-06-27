import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: number
            email: string
            role: number
            name: string
            image: string
            email_verified: boolean
            provider: string
            create_at: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: number
        email: string
        role: number
        name: string
        image: string
        email_verified: boolean
        provider: string
        create_at: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number
        email: string
        role: number
        name: string
        image: string
        email_verified: boolean
        provider: string
        create_at: string
    }
}
