
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'

import { FiAtSign } from '@react-icons/all-files/fi/FiAtSign'

import { GlobalContext } from '../utils/context'

import type { MentionsStore } from '../stores/mentions'
import type { Message } from '../stores/channels'
import type { RootStore } from "../stores/root"

interface MentionProps {
  msg: Message
  state: RootStore
}

const Mention = observer(({msg, state}: MentionProps) => {
  const onClick = (evt: React.MouseEvent<HTMLElement>) => {
    // Find the same message in the channel store.
    const channel = state.channels.channels[msg.room]
    if (channel === undefined) {
      // Do something if the channel isn't open? Open it?
      return
    }
    for (const chanMsg of channel.messages) {
      if (chanMsg.id === msg.id) {
        chanMsg.pingFocus()
        break
      }
    }
  }

  return <Dropdown.Item onClick={onClick}>
    <div>
      <strong>{msg.room}</strong>
      {" - "}
      <strong>{msg.username}</strong>
      {" - "}
      <em>{msg.ts.toDate().toLocaleTimeString()}</em>
    </div>
    <div css={{
      width: 300,
      overflow: "hidden",
      whiteSpace: "break-spaces",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": "3",
    }}>{msg.content}</div>
  </Dropdown.Item>
})

interface MentionsListProps {
  state: RootStore
}

const MentionsList = observer(({state}: MentionsListProps) => {
  return <>
    {state.mentions.mentions.map(msg => (
      <Mention key={msg.id} msg={msg} state={state} />
    ))}
  </>
})

export const MentionsMenu = observer(() => {
  const ctx = useContext(GlobalContext)
  const onToggle = (nextShow: boolean) => {
    if (nextShow) {
      ctx.state.mentions.clearPending()
    }
  }

  return <Dropdown onToggle={onToggle}>
    <Dropdown.Toggle id="mentions-menu" className="position-relative">
      <FiAtSign />
      {ctx.state.mentions.pending > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {ctx.state.mentions.pending}
        <span className="visually-hidden">unread mentions</span>
      </span>}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <MentionsList state={ctx.state} />
    </Dropdown.Menu>
  </Dropdown>
})
