import CryptoJS from 'crypto-js'

class SecureSessionStorage {
    private secretKey: string

    constructor(secretKey: string) {
        if (!secretKey) {
            console.warn('SecureSessionStorage: secret key is empty')
        }
        this.secretKey = secretKey
    }

    private encrypt(value: unknown): string {
        const text = JSON.stringify(value)
        return CryptoJS.AES.encrypt(text, this.secretKey).toString()
    }

    private decrypt<T = unknown>(cipherText: string): T | null {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey)
            const decrypted = bytes.toString(CryptoJS.enc.Utf8)
            if (!decrypted) return null
            return JSON.parse(decrypted) as T
        } catch (err) {
            console.error('SecureSessionStorage: decrypt error', err)
            return null
        }
    }

    setItem(key: string, value: unknown): void {
        if (typeof window === 'undefined') return
        try {
            const cipher = this.encrypt(value)
            window.sessionStorage.setItem(key, cipher)
        } catch (err) {
            console.error(`SecureSessionStorage: setItem(${key}) error`, err)
        }
    }

    getItem<T = unknown>(key: string): T | null {
        if (typeof window === 'undefined') return null
        try {
            const cipher = window.sessionStorage.getItem(key)
            if (!cipher) return null
            return this.decrypt<T>(cipher)
        } catch (err) {
            console.error(`SecureSessionStorage: getItem(${key}) error`, err)
            return null
        }
    }

    updateItem(key: string, value: unknown): void {
        this.setItem(key, value)
    }

    removeItem(key: string): void {
        if (typeof window === 'undefined') return
        try {
            window.sessionStorage.removeItem(key)
        } catch (err) {
            console.error(`SecureSessionStorage: removeItem(${key}) error`, err)
        }
    }
}

const secureSessionStorage = new SecureSessionStorage(
    process.env.NEXT_PUBLIC_STORAGE_SECRET ?? ''
)

export default secureSessionStorage
