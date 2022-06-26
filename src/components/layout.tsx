import 'bootstrap/dist/css/bootstrap.css'
import './layout.css'

import ClipboardJS from 'clipboard'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from "@firebase/util"
import { Link } from 'gatsby'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { Helmet } from 'react-helmet'

import { BsFillPersonFill } from '@react-icons/all-files/bs/BsFillPersonFill'
import { FaPlus } from "@react-icons/all-files/fa/FaPlus"

import { GlobalContext } from '../utils/context'
import { MentionsMenu } from './mentions'
import { FlagsMenu } from './flags'

import type { GlobalContextProps } from '../utils/context'

interface LoginProps {
  ctx: GlobalContextProps
}

const Login = observer(({ctx}: LoginProps) => {
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
    const form = evt.currentTarget
    evt.preventDefault()
    evt.stopPropagation()

    const email = (document.getElementById("login-email") as HTMLInputElement | null)?.value
    const password = (document.getElementById("login-password") as HTMLInputElement | null)?.value

    if (form.checkValidity()) {
      await signInWithEmailAndPassword(ctx.auth!, email || "", password || "")
    }
  }

  return <Form onSubmit={onSubmit}>
    <Form.Group className="mb-3" controlId="login-email">
      <Form.Label>Email address</Form.Label>
      <Form.Control type="email" placeholder="Email" required={true} />
    </Form.Group>

    <Form.Group className="mb-3" controlId="login-password">
      <Form.Label>Password</Form.Label>
      <Form.Control type="password" placeholder="Password" required={true} />
    </Form.Group>

    <Button variant="primary" type="submit">
      Log In
    </Button>
  </Form>
})

interface RegisterProps {
  ctx: GlobalContextProps
}

const Register = observer(({ctx}: RegisterProps) => {
  const [validated, setValidated] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
    const form = evt.currentTarget
    evt.preventDefault()
    evt.stopPropagation()

    const email = (document.getElementById("register-email") as HTMLInputElement | null)?.value
    const password = (document.getElementById("register-password") as HTMLInputElement | null)?.value
    const password2 = (document.getElementById("register-password2") as HTMLInputElement | null)?.value

    let valid = form.checkValidity()
    setValidated(true)

    if (password !== password2) {
      (document.getElementById("register-password2") as HTMLInputElement).setCustomValidity("Passwords must match.")
      valid = false
    } else {
      (document.getElementById("register-password2") as HTMLInputElement).setCustomValidity("")
    }

    if (!valid) {
      return
    }

    try {
      await createUserWithEmailAndPassword(ctx.auth!, email || "", password || "")
    } catch (e) {
      console.log(e)
      if (e instanceof FirebaseError) {
        switch (e.code) {
        case "auth/email-already-in-use":
          setFirebaseError("Your email is already in use.")
          break
        default:
          setFirebaseError(e.message)
        }
      } else {
        setFirebaseError((e as any).toString())
      }
    }
  }

  return <Form onSubmit={onSubmit} noValidate validated={validated}>
    <Form.Group className="mb-3" controlId="register-email">
      <Form.Label>Email address</Form.Label>
      <Form.Control type="email" placeholder="Email" required={true} />
    </Form.Group>

    <Form.Group className="mb-3" controlId="register-password">
      <Form.Label>Password</Form.Label>
      <Form.Control type="password" placeholder="Password" required={true} />
    </Form.Group>

    <Form.Group className="mb-3" controlId="register-password2">
      <Form.Label>Password</Form.Label>
      <Form.Control type="password" placeholder="Confirm Password" required={true} />
      <Form.Control.Feedback type="invalid">
        Passwords must match.
      </Form.Control.Feedback>
    </Form.Group>

    {firebaseError && <Form.Group className="mb-3">
      <Form.Control.Feedback type="invalid" className="d-block">
        {firebaseError}
      </Form.Control.Feedback>
    </Form.Group>}

    <Button variant="primary" type="submit">
      Register
    </Button>
  </Form>
})

interface LoginOrRegisterProps {
  ctx: GlobalContextProps
}

const LoginOrRegister = observer(({ctx}: LoginOrRegisterProps) => {
  const [loginMode, setLoginMode] = useState(true)

  if (loginMode) {
    return <div className="my-2">
      <h2>Log In</h2>
      <p>
        Or <a href="#" onClick={evt => { evt.preventDefault(); setLoginMode(false) }}>register for a new account</a>.
      </p>
      <Login ctx={ctx} />
    </div>
  } else {
    return <div className="my-2">
    <h2>Register</h2>
    <p>
      Or <a href="#" onClick={evt => { evt.preventDefault(); setLoginMode(true) }}>log in to your existing account</a>.
    </p>
    <Register ctx={ctx} />
  </div>
  }
})

const ChannelMenuList = observer(() => {
  const ctx = useContext(GlobalContext)
  return <>
    {(ctx.state?.channels.availableChannels || []).map(chan => {
      if (ctx.state?.settings.channels.slice().includes(chan)) {
        return null
      }
      return <Dropdown.Item key={chan} onClick={() => ctx.state?.settings.addChannel(chan)}>{chan}</Dropdown.Item>
    })}
  </>
})

interface LayoutContentProps {
  ctx: GlobalContextProps
  children: React.ReactNode
}

const LayoutContent = observer(({ctx, children}: LayoutContentProps) => {
  if(typeof document === "undefined" || !ctx.state?.auth.ready) {
    // Auth hasn't actually loaded yet.
    return <div data-type="layout-loading" key="layout-loading">Loading ...</div>
  } else if (!ctx.state.auth.loggedIn) {
    // User is logged out.
    return <LoginOrRegister ctx={ctx} key="login-or-register" />
  } else if (ctx.state.auth.username === null) {
    //
    return <div key="enrollment">
      <p>
        Your account isn't recognized.
      </p>
      <p>
        If you haven't already, please <a href="https://farmrpg.com/index.php#!/sendmessage.php?to=BuddyBot" target="_blank">
        send a DM to the Farm RPG user BuddyBot</a> with the subject "register" and the body
        "register {ctx.state.auth.user?.uid}". Then click reload.
      </p>
      <p>
        <Button variant="primary" onClick={() => ctx.state?.auth.reload()}>Reload</Button>
      </p>
      <p>
        If this doesn't seem to be working, please contact Coderanger for further assistance.
      </p>
    </div>
  } else if (!ctx.state.auth.isStaff) {
    return <div key="not-allowed">This tool is only for Farm RPG staff members.</div>
  }
  // Default case.
  return <>{children}</>
})

interface LayoutProps {
  children: React.ReactNode
}

export default observer(({ children }: LayoutProps) => {
  const ctx = useContext(GlobalContext)

  useEffect(() => {
    const clipboard = new ClipboardJS(".clipboard")
    clipboard.on("success", (evt) => {
      ctx.addToast({
        title: "Copied to clipboard",
        body: `"${evt.text}" copied to the clipboard`,
        delay: 2000,
      })
    })
    return () => clipboard.destroy()
  }, [])

  return (<>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Mod Tools</title>
    </Helmet>
    <div
      aria-live="polite"
      aria-atomic="true"
      className="position-fixed top-0 end-0"
      css={{ minWidth: 400, zIndex: 100 }}
    >
      <ToastContainer position="top-end" className="p-3">
        {ctx.toasts.map(toast => (
          <Toast
            key={toast.id}
            show={!toast.hiding}
            autohide={toast.delay !== undefined}
            delay={toast.delay}
            onClose={() => ctx.removeToast(toast.id)}
          >
            <Toast.Header>
              <strong className="me-auto">{toast.title}</strong>
              <small className="text-muted">just now</small>
            </Toast.Header>
            <Toast.Body>{toast.body}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
    <main className="d-flex h-100" onMouseMove={evt => ctx.state?.ui.ping()} onTouchStart={evt => ctx.state?.ui.ping()}>
      <div className="border-end border-4 me-2 bg-secondary d-flex flex-column gap-2 align-items-center py-2" css={{width: 80}}>
        <Dropdown>
          <Dropdown.Toggle id="user-menu">
            <BsFillPersonFill />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>{ctx.state?.auth.username}</Dropdown.Item>
            <Dropdown.Item>{ctx.state?.auth.user?.email}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => ctx.state?.auth.signOut()}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle id="channel-menu">
            <FaPlus />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <ChannelMenuList />
          </Dropdown.Menu>
        </Dropdown>
        <MentionsMenu />
        <FlagsMenu />
      </div>
      <LayoutContent ctx={ctx} children={children} />
    </main>
  </>)
})
