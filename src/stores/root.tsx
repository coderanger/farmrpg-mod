import { configure, makeAutoObservable } from 'mobx'

import { AuthStore } from './auth'
import { ChannelStore } from './channels'
import { Settings } from './settings'
import { UIState } from './ui'

import type { Firestore } from "firebase/firestore"

export class RootStore {
  auth: AuthStore
  channels: ChannelStore
  settings: Settings
  ui: UIState

  constructor() {
    makeAutoObservable(this)
    this.auth = new AuthStore()
    this.channels = new ChannelStore()
    this.settings = new Settings()
    this.ui = new UIState()
  }
}

// configure({
//   enforceActions: "always",
//   computedRequiresReaction: true,
//   reactionRequiresObservable: true,
//   observableRequiresReaction: true,
//   disableErrorBoundaries: true
// })
