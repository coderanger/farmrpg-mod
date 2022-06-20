import { collectionGroup, limit, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore'
import { action, makeAutoObservable, observable, when } from 'mobx'

import type { AuthStore } from "./auth"
import type { Firestore, QuerySnapshot, DocumentData, Unsubscribe } from "firebase/firestore"

export class MessageFlags {
  channel: string
  msgId: string
  ts: Timestamp
  flags: number

  constructor(channel: string, msgId: string, data: Record<string, any>) {
    makeAutoObservable(this)
    this.channel = channel
    this.msgId = msgId
    this.ts = data.ts
    this.flags = data.flags
  }
}

export class ChatModStore {
  db: Firestore
  readonly recentFlags = observable<MessageFlags>([])
  readonly flagsById = observable<string, MessageFlags>(new Map)
  paused: boolean = false
  unsubscribe: Unsubscribe | null = null
  pendingFlags: number = 0
  pendingInitialized: boolean = false

  constructor(db: Firestore, auth: AuthStore) {
    makeAutoObservable(this, {db: false, onSnapshot: action.bound})
    this.db = db
    if (typeof document !== "undefined") {
      when(
        () => auth.ready,
        () => this.listen()
      )
    }
  }

  get listening() {
    return this.unsubscribe !== null
  }

  clearPending() {
    this.pendingFlags = 0
  }

  listen() {
    if (!this.listening) {
      const q = query(
        collectionGroup(this.db, "mod"),
        orderBy("ts", "desc"),
        limit(200)
      )
      this.unsubscribe = onSnapshot(q, this.onSnapshot, console.error)
    }
  }

  onSnapshot(snapshot: QuerySnapshot<DocumentData>) {
    const newRecentFlags: MessageFlags[] = []
    const newFlagsById: Map<string, MessageFlags> = new Map
    snapshot.forEach(mod => {
      switch (mod.id) {
      case "flags":
        const msgRef = mod.ref.parent.parent
        const channel = msgRef?.parent?.parent?.id
        const msgId = msgRef?.id
        if (channel !== undefined && msgId !== undefined) {
          const newFlags = new MessageFlags(channel, msgId, mod.data())
          if (newRecentFlags.length <= 5) {
            newRecentFlags.push(newFlags)
          }
          newFlagsById.set(msgId, newFlags)
          if (this.pendingInitialized && !this.flagsById.has(msgId)) {
            this.pendingFlags++
          }
        }
        break
      default:
        throw `Unknown mod document ${mod.id}`
      }
    })
    this.recentFlags.replace(newRecentFlags)
    this.flagsById.replace(newFlagsById)
    if (!this.pendingInitialized) {
      this.pendingInitialized = true
    }
  }

  unlisten() {
    if (this.unsubscribe !== null) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  pause() {
    if (!this.paused) {
      this.paused = true
      this.unlisten()
    }
  }

  resume() {
    if (this.paused) {
      this.paused = false
      this.listen()
    }
  }
}
