import CryptoJS from "crypto-js";

const secretKey =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDU5MTc4NDR9.kOY-nODYvEvhv_WnTXU2KQ5usTluKPwcrozYVhVhFLI'

export const encrypt = async (chatId: number) => {
    return CryptoJS.AES.encrypt(String(chatId), secretKey).toString()
}

export const decrypt = async (verifyChatId: string) => {
    try {
        const bytes = CryptoJS.AES.decrypt(verifyChatId, secretKey)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        return decrypted || null
    } catch (e) {
        return null
    }
}

export const encryptURL = async (url: string) => {
    return CryptoJS.AES.encrypt(String(url), secretKey).toString()
}

export const decryptURL = async (verifyURL: string) => {
    try {
        const bytes = CryptoJS.AES.decrypt(verifyURL, secretKey)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        return decrypted || null
    } catch (e) {
        return null
    }
}