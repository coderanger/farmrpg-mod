import type { Auth, User, IdTokenResult } from "firebase/auth"
import {
    browserLocalPersistence, getAuth, onAuthStateChanged, reload, setPersistence, signOut
} from 'firebase/auth'
import { action, makeAutoObservable } from 'mobx'

import { app } from '../utils/firebase'

export class AuthStore {
  auth: Auth
  ready: boolean = false
  loggedIn: boolean = false
  user: User | null = null
  role: string | null = null
  username: string | null = null

  constructor() {
    makeAutoObservable(this, {"onAuthStateChanged": action.bound, "onIdTokenResult": action.bound})
    this.auth = getAuth(app)
    setPersistence(this.auth, browserLocalPersistence)
    onAuthStateChanged(this.auth, this.onAuthStateChanged)
  }

  onAuthStateChanged(user: User | null) {
    console.debug("onAuthStateChanged", user)
    if (user === null) {
      this.user = null
      this.role = null
      this.username = null
      this.loggedIn = false
      this.ready = true
    } else {
      this.user = user
      this.loggedIn = !user.isAnonymous
      if (this.ready) {
        this.ready = false
      }
      user.getIdTokenResult().then(this.onIdTokenResult)
    }
  }

  onIdTokenResult(token: IdTokenResult) {
    console.debug("onIdTokenResult", token)
    if (token.claims.role === undefined) {
      this.role = null
    } else {
      this.role = token.claims.role as string
    }
    if (token.claims.username === undefined) {
      this.username = null
    } else {
      this.username = token.claims.username as string
    }
    if (!this.ready) {
      this.ready = true
    }
  }

  get isStaff() {
    return this.ready && this.loggedIn && (this.role === "farmhand" || this.role === "ranger")
  }

  signOut() {
    signOut(this.auth)
  }

  reload() {
    if (this.loggedIn && this.user) {
      reload(this.user).then(() => this.user?.getIdTokenResult(true).then(this.onIdTokenResult))
    }
  }
}
