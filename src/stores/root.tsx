import { getFirestore } from 'firebase/firestore'
import { configure, makeAutoObservable } from 'mobx'

import { app } from '../utils/firebase'
import { AuthStore } from './auth'
import { ChannelStore } from './channels'
import { ChatModStore } from './flags'
import { MentionsStore } from './mentions'
import { Settings } from './settings'
import { UIState } from './ui'

export class RootStore {
  auth: AuthStore
  channels: ChannelStore
  chatMods: ChatModStore
  mentions: MentionsStore
  settings: Settings
  ui: UIState

  constructor() {
    makeAutoObservable(this)
    const db = getFirestore(app)
    this.auth = new AuthStore()
    this.channels = new ChannelStore(db)
    this.chatMods = new ChatModStore(db, this.auth)
    this.mentions = new MentionsStore(db, this.auth)
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
