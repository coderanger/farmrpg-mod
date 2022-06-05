import { action, makeAutoObservable } from "mobx"
import { collection, query, onSnapshot, Timestamp, orderBy, limit } from "firebase/firestore"

import type { Firestore, QuerySnapshot, DocumentData, Unsubscribe } from "firebase/firestore"

export class Message {
  id: string
  room: string
  username: string
  emblem: string
  ts: Timestamp
  content: string
  deleted: boolean

  constructor(data: Record<string, any>) {
    makeAutoObservable(this)
    this.id = data.id
    this.room = data.room
    this.username = data.username
    this.emblem = data.emblem
    this.ts = data.ts
    this.content = data.content
    this.deleted = data.deleted
  }
}

export class Channel {
  db: Firestore
  channel: string
  paused: boolean = false
  messages: Message[] = []
  unsubscribe: Unsubscribe | null = null

  constructor(db: Firestore, channel: string) {
    makeAutoObservable(this, {"onSnapshot": action.bound})
    this.db = db
    this.channel = channel
  }

  get listening() {
    return this.unsubscribe !== null
  }

  listen() {
    if (!this.listening) {
      const q = query(collection(this.db, "rooms", this.channel, "chats"), orderBy("ts", "desc"), limit(10))
      console.debug("Listening to channel query", q)
      this.unsubscribe = onSnapshot(q, this.onSnapshot, console.error)
    }
  }

  onSnapshot(snapshot: QuerySnapshot<DocumentData>) {
    const newMessages: Message[] = []
    snapshot.forEach(msg => {
      console.debug("Got message", msg.data())
      newMessages.push(new Message(msg.data()))
    })
    this.messages = newMessages
  }

  unlisten() {
    if (this.unsubscribe !== null) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  pause() {
    this.paused = true
    this.unlisten()
  }

  resume() {
    this.paused = false
    this.listen()
  }
}

export class ChannelStore {
  db: Firestore
  channels: Record<string, Channel> = {}

  constructor(db: Firestore) {
    makeAutoObservable(this)
    this.db = db
  }

  listen(channel: string) {
    let chan = this.channels[channel]
    if (chan === undefined) {
      chan = new Channel(this.db, channel)
      chan.listen()
      this.channels[channel] = chan
    }
    return chan
  }

  unlisten(channel: string) {
    if (this.channels[channel]) {
      this.channels[channel].unlisten()
      delete this.channels[channel]
    }
  }

  pause() {
    for (const channel in this.channels) {
      this.channels[channel].pause()
    }
  }

  resume() {
    for (const channel in this.channels) {
      this.channels[channel].resume()
    }
  }
}
