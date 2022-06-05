import { getAnalytics } from 'firebase/analytics'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

import { useToasts } from '../hooks/toasts'
import { app } from './firebase'
import { ChannelStore } from '../stores/channels'

import type { FirebaseApp } from "firebase/app"
import type { Analytics } from "firebase/analytics"
import type { Auth, User } from "firebase/auth"
import type { Firestore } from "firebase/firestore"

export interface GlobalContextProps {
  firebase: FirebaseApp | null
  analytics: Analytics | null
  auth: Auth | null
  user: User | null | undefined
  db: Firestore | null
  toasts: ReturnType<typeof useToasts>[0]
  addToast: ReturnType<typeof useToasts>[1]
  removeToast: ReturnType<typeof useToasts>[2]
  channels: ChannelStore | null
}

export const GlobalContext = React.createContext<GlobalContextProps>({
  firebase: null,
  analytics: null,
  auth: null,
  user: null,
  db: null,
  toasts: [],
  addToast: () => null,
  removeToast: () => null,
  channels: null,
})

interface ProviderProps {
  children: React.ReactNode
}

export const Provider = ({ children }: ProviderProps) => {
  const [auth, setAuth] = useState<Auth | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [db, setDb] = useState<Firestore | null>(null)
  const [toasts, addToast, removeToast] = useToasts()
  const [channels, setChannels] = useState<ChannelStore | null>(null)

  useEffect(() => {
    if (typeof document !== null) {
      const auth = getAuth(app)
      setAuth(auth)
      onAuthStateChanged(auth, setUser)
      setAnalytics(getAnalytics(app))
      const db = getFirestore(app)
      setDb(db)
      setChannels(new ChannelStore(db))
    }
  }, [])

  return (
    <GlobalContext.Provider value={{ firebase: app, analytics, auth, user, db, toasts, addToast, removeToast, channels }}>
      {children}
    </GlobalContext.Provider>
  )
}

interface WrapProps {
  element: React.ReactNode
}

export default ({ element }: WrapProps) => (
  <Provider>
    {element}
  </Provider>
)
