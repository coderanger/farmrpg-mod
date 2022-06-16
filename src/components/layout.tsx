import 'bootstrap/dist/css/bootstrap.css'
import './layout.css'

import ClipboardJS from 'clipboard'
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { Link } from 'gatsby'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { Helmet } from 'react-helmet'

import { BsFillPersonFill } from '@react-icons/all-files/bs/BsFillPersonFill'

import { GlobalContext } from '../utils/context'

import type { GlobalContextProps } from '../utils/context'

interface LoginProps {
  ctx: GlobalContextProps
}

const Login = ({ctx}: LoginProps) => {
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    const resp = await fetch("https://api.buddy.farm/login", {
      method: "POST",
      body: JSON.stringify({
        email: (document.getElementById("login-email") as HTMLInputElement | null)?.value,
        password: (document.getElementById("login-password") as HTMLInputElement | null)?.value,
      }),
    })
    if (!resp.ok) {
      throw `Error getting login token (${resp.status}): ${await resp.text()}`
    }
    const respJson = await resp.json()

    const firebaseResp = await signInWithCustomToken(ctx.auth!, respJson.signed_jwt)
    console.log(firebaseResp)
  }

  return <div className="login">
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="login-email">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Email" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="login-password">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  </div>
}

interface LayoutProps {
  children: React.ReactNode
}

export default observer(({ children }: LayoutProps) => {
  const ctx = useContext(GlobalContext)

  let content = children

  if(ctx.user === undefined) {
    // Auth hasn't actually loaded yet.
    content = <>
      <div>Loading ...</div>
    </>
  } else if (ctx.user === null || ctx.user.isAnonymous) {
    // User is logged out.
    content = <Login ctx={ctx} />
  }

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
            <Dropdown.Item>{ctx.user?.email}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => signOut(ctx.auth!)}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {content}
    </main>
  </>)
})
