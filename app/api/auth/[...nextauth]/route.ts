import axios from "axios"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import LineProvider from "next-auth/providers/line"

const API = process.env.PRIVATE_API_AUTH
const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) {
                    throw new Error(JSON.stringify({ message: "ไม่พบข้อมูล" }))
                }
            
                const payload = {
                    email: credentials.email,
                    password: credentials.password
                }

                try {
                    const res = await axios.post(`${API}/sign_in`, payload)
                    const resData = res.data

                    if (resData.status === 1) {
                        const user = {
                            id: resData.data.user.web_user_id,
                            email: resData.data.user.email,
                            name: resData.data.user.username,
                            role: resData.data.user.role_id,
                            email_verified: resData.data.user.email_verified,
                            image: resData.data.user.image != null ? resData.data.user.image : "/profile/profile-user.png",
                            provider: resData.data.user.provider,
                            create_at: resData.data.user.create_at
                        }
                        return user
                    } else {
                        throw new Error(JSON.stringify({ message: resData.message }))
                    }
                } catch (error: unknown) {
                    let message = ''
                    if (axios.isAxiosError(error) && error.response) {
                        message = error.response.data?.message || message
                    }
                    throw new Error(JSON.stringify({ message: message }))
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID!,
            clientSecret: process.env.LINE_CLIENT_SECRET!
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            try {
                if (account?.provider === "google") {
                    const allowedDomains = ["rmuti.ac.th"]
                    const emailDomain = user.email?.split("@")[1] || ""

                    if (!allowedDomains.includes(emailDomain)) {
                        const message = "อนุญาตเฉพาะอีเมล @rmuti.ac.th"
                        return `/sign_in?error=${encodeURIComponent(JSON.stringify({ message: message }))}`
                    }
                }

                const res = await axios.post(`${API}/auth/oauth`, { user, account })
                const resData = res.data
                if (resData?.status === 1) {
                    user.id = resData.data.user.web_user_id
                    user.email = resData.data.user.email
                    user.role = resData.data.user.role_id
                    user.email_verified = resData.data.user.email_verified
                    user.name = resData.data.user.username
                    user.image = resData.data.user.image != null ? resData.data.user.image : "/profile/profile-user.png"
                    user.provider = resData.data.user.provider
                    user.create_at = resData.data.user.create_at
                } else {
                    return `/sign_in?error=${encodeURIComponent(JSON.stringify({ message: resData.message }))}`
                }
                return true
            } catch (error: unknown) {
                let message = ''
                if (axios.isAxiosError(error) && error.response) {
                    message = error.response.data?.message || message
                }
                return `/sign_in?error=${encodeURIComponent(JSON.stringify({ message: message }))}`
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = Number(user.id)
                token.email = user.email
                token.role = user.role
                token.name = user.name
                token.image = user.image
                token.email_verified = user.email_verified
                token.provider = user.provider
                token.create_at = user.create_at
            }
        
            return token
        },
        async session({ session, token }) {
            session.user = {
                id: token.id,
                email: token.email,
                name: token.name,
                role: token.role,
                image: token.image,
                email_verified: token.email_verified,
                provider: token.provider,
                create_at: token.create_at,
            }
            return session
        }          
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 30,
        updateAge: 60 * 60
    },
    pages: {
        signIn: '/sign_in',
    }
})

export { handler as GET, handler as POST }