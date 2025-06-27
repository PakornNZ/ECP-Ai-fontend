'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue)

    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        try {
            const item = localStorage.getItem(key)
            if (item) {
                setValue(JSON.parse(item))
            }
        } catch (error) {
            console.error('Failed to get from localStorage:', error)
        }
        setIsInitialized(true)
    }, [key])

    useEffect(() => {
        if (!isInitialized) return

        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error('Failed to save to localStorage:', error)
        }
    }, [key, value, isInitialized])

    return [value, setValue] as const
}