interface ChatHistoryProps {
    id: number
    chat_history: string
    date: Date
}

export default function HistoryGroup(chats: ChatHistoryProps[]) {
    let loading = true
    if (!Array.isArray(chats)) return { today: [], last7Days: [], last30Days: [], older: [], loading: loading }

    const now = new Date()
    const startOfToday = new Date(now.setHours(0, 0, 0, 0))
    const today: ChatHistoryProps[] = []
    const last7Days: ChatHistoryProps[] = []
    const last30Days: ChatHistoryProps[] = []
    const older: ChatHistoryProps[] = []

    chats.forEach(chat => {
        const chatDate = new Date(chat.date)
        const startOfChatDate = new Date(chatDate.setHours(0, 0, 0, 0))
        const diffTime = now.getTime() - startOfChatDate.getTime()
        const diffDays = diffTime / (1000 * 3600 * 24)

        if (diffDays < 1 && startOfChatDate.getTime() === startOfToday.getTime()) {
            today.push(chat)
        } else if (diffDays <= 7) {
            last7Days.push(chat)
        } else if (diffDays <= 30) {
            last30Days.push(chat)
        } else {
            older.push(chat)
        }
    })
    loading = false
    return { today, last7Days, last30Days, older, loading: loading }
}