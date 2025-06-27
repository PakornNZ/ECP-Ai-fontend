export function FormatDateTime(date: string) {
    if (!date) return null

    const d = new Date(date)
    
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear() + 543

    const hour = d.getHours().toString().padStart(2, '0')
    const minute = d.getMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hour}:${minute}`
}