export function formatNumber(num: number): { value: string, suffix: string } {
    if (num >= 1000000) {
        const value = num / 1000000
        return { value: value.toFixed(2), suffix: 'M' }
    }
    if (num >= 1000) {
        const value = num / 1000
        return { value: value.toFixed(2), suffix: 'K' }
    }
    return { value: num.toString(), suffix: '' };
}

export function formatFullNumber(num: number): string {
    return num.toLocaleString();
}