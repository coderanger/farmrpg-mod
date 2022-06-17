import { makeAutoObservable } from 'mobx'

import { AuthStore } from './auth'
import { ChannelStore } from './channels'
import { UIState } from './ui'

import type { Firestore } from "firebase/firestore"

export class RootStore {
  auth: AuthStore
  channels: ChannelStore
  ui: UIState

  constructor(db: Firestore) {
    makeAutoObservable(this)
    this.auth = new AuthStore()
    this.channels = new ChannelStore(db)
    this.ui = new UIState()
  }
}
