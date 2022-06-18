import { collectionGroup, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { action, makeAutoObservable, observable, when } from 'mobx'

import { Message } from './channels'

import type { AuthStore } from "./auth"
import type { Firestore, QuerySnapshot, DocumentData, Unsubscribe } from "firebase/firestore"

export class MentionsStore {
  db: Firestore
  username: string | null = null
  readonly mentions = observable<Message>([])
  paused: boolean = false
  unsubscribe: Unsubscribe | null = null
  pending: number = 0
  pendingInitialized: boolean = false

  constructor(db: Firestore, auth: AuthStore) {
    makeAutoObservable(this, {db: false, onSnapshot: action.bound})
    this.db = db
    if (typeof document !== "undefined") {
      when(
        () => auth.ready && auth.username !== null,
        () => this.setUsername(auth.username!)
      )
    }
  }

  get listening() {
    return this.unsubscribe !== null
  }

  setUsername(username: string) {
    this.username = username
    if (!this.listening) {
      this.listen()
    }
  }

  clearPending() {
    this.pending = 0
  }

  listen() {
    if (!this.listening && this.username !== null) {
      const q = query(
        collectionGroup(this.db, "chats"),
        where("mentions", "array-contains", this.username),
        orderBy("ts", "desc"),
        limit(5)
      )
      this.unsubscribe = onSnapshot(q, this.onSnapshot, console.error)
    }
  }

  onSnapshot(snapshot: QuerySnapshot<DocumentData>) {
    const existingMessages: Record<string, boolean> = {}
    for (const msg of this.mentions) {
      existingMessages[msg.id] = true
    }
    const newMessages: Message[] = []
    snapshot.forEach(msg => {
      newMessages.push(new Message(msg.data()))
      if (this.pendingInitialized && !existingMessages[msg.id]) {
        this.pending++
      }
    })
    this.mentions.replace(newMessages)
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
