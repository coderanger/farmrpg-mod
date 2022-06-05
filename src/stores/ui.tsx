import { action, makeAutoObservable } from "mobx"
import { now } from "mobx-utils"

export class UIState {
  lastInteraction: number

  constructor() {
    makeAutoObservable(this)
    this.lastInteraction = Date.now()
  }

  get isIdle() {
    return (now() - this.lastInteraction) >= 180_000
  }

  ping() {
    this.lastInteraction = Date.now()
  }
}
