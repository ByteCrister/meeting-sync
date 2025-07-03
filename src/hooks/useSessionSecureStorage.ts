'use client'

import secureSessionStorage from '@/utils/client/storage/secureSessionStorage'
import { useState, useEffect, Dispatch, SetStateAction } from 'react'

export function useSessionSecureStorage<T>(
  key: string,
  defaultValue: T,
  shouldPersist: boolean = true
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (!shouldPersist) return

    const stored = secureSessionStorage.getItem<T>(key)
    if (stored !== null) setValue(stored)
  }, [key, shouldPersist])

  useEffect(() => {
    if (!shouldPersist) return

    secureSessionStorage.setItem(key, value)
  }, [key, value, shouldPersist])

  const remove = () => {
    secureSessionStorage.removeItem(key)
    setValue(defaultValue)
  }

  return [value, setValue, remove]
}