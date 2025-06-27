import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'profile.line-scdn.net',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'obs.line-scdn.net',
                port: '',
                pathname: '/**'
            }
        ]
    }
}

export default nextConfig