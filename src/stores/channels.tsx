import {
    collection, getDocs, limit, onSnapshot, orderBy, query, Timestamp
} from 'firebase/firestore'
import { action, makeAutoObservable, observable } from 'mobx'

import type { Firestore, QuerySnapshot, DocumentData, Unsubscribe } from "firebase/firestore"

export class Message {
  id: string
  room: string
  username: string
  emblem: string
  ts: Timestamp
  content: string
  deleted: boolean
  mentions: string[]
  focus: boolean = false
  focusTimer: number | undefined = undefined
  element: HTMLDivElement | null = null

  constructor(data: Record<string, any>) {
    makeAutoObservable(this, {clearFocus: action.bound, setElement: action.bound})
    this.id = data.id
    this.room = data.room
    this.username = data.username
    this.emblem = data.emblem
    this.ts = data.ts
    this.content = data.content
    this.deleted = data.deleted
    this.mentions = data.mentions
  }

  setElement(element: HTMLDivElement | null) {
    this.element = element
  }

  pingFocus() {
    if (this.focusTimer !== undefined) {
      window.clearTimeout(this.focusTimer)
    }
    this.focus = true
    this.focusTimer = window.setTimeout(this.clearFocus, 250)
    if (this.element !== null) {
      this.element.scrollIntoView({behavior: "smooth", block: "nearest"})
    }
  }

  clearFocus() {
    this.focus = false
    this.focusTimer = undefined
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
      const q = query(collection(this.db, "rooms", this.channel, "chats"), orderBy("ts", "desc"), limit(20))
      this.unsubscribe = onSnapshot(q, this.onSnapshot, console.error)
    }
  }

  onSnapshot(snapshot: QuerySnapshot<DocumentData>) {
    const newMessages: Message[] = []
    snapshot.forEach(msg => {
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

export class ChannelStore {
  db: Firestore
  channels: Record<string, Channel> = {}
  readonly availableChannels = observable<string>([])

  constructor(db: Firestore) {
    makeAutoObservable(this, {"updateAvailableChannels": action.bound})
    this.db = db
    if (typeof document !== "undefined") {
      getDocs(collection(this.db, "rooms")).then(this.updateAvailableChannels)
    }
  }

  updateAvailableChannels(resp: QuerySnapshot<DocumentData>) {
    const newChannels = []
    for (const doc of resp.docs) {
      newChannels.push(doc.id)
    }
    newChannels.sort()
    this.availableChannels.replace(newChannels)
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
