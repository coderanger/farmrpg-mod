import { makeAutoObservable } from 'mobx'

import { ChannelStore } from './channels'
import { UIState } from './ui'

import type { Firestore } from "firebase/firestore"

export class RootStore {
  channels: ChannelStore
  ui: UIState

  constructor(db: Firestore) {
    makeAutoObservable(this)
    this.channels = new ChannelStore(db)
    this.ui = new UIState()
  }
}
