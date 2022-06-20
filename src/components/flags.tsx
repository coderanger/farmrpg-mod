
import { observer } from 'mobx-react-lite'
import React, { useContext, useMemo } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'

import { BsFillFlagFill } from '@react-icons/all-files/bs/BsFillFlagFill'

import { GlobalContext } from '../utils/context'

import type { MessageFlags } from '../stores/flags'
import type { RootStore } from "../stores/root"

interface FlagProps {
  flag: MessageFlags
  state: RootStore
}

const Flag = observer(({flag, state}: FlagProps) => {
  // Find the original message if possible.
  const msg = state.channels.channels[flag.channel]?.messagesById.get(flag.msgId)
  if (msg === undefined) {
    return <></>
  }

  const onClick = (evt: React.MouseEvent<HTMLElement>) => {
    msg.pingFocus()
  }

  return <Dropdown.Item onClick={onClick}>
    <div>
      <strong>{msg.room}</strong>
      {" - "}
      <strong>{msg.username}</strong>
      {" - "}
      <em>{flag.ts.toDate().toLocaleTimeString()}</em>
      {" - "}
      <span className="text-danger">{flag.flags} <BsFillFlagFill /></span>
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

interface FlagsListProps {
  state: RootStore
}

const FlagsList = observer(({state}: FlagsListProps) => {
  return <>
    {state.chatMods.recentFlags.map(flag => (
      <Flag key={flag.msgId} flag={flag} state={state} />
    ))}
  </>
})

export const FlagsMenu = observer(() => {
  const ctx = useContext(GlobalContext)
  const onToggle = (nextShow: boolean) => {
    if (nextShow) {
      ctx.state.chatMods.clearPending()
    }
  }

  return <Dropdown onToggle={onToggle}>
    <Dropdown.Toggle id="flags-menu" className="position-relative">
      <BsFillFlagFill />
      {ctx.state.chatMods.pendingFlags > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {ctx.state.chatMods.pendingFlags}
        <span className="visually-hidden">unread flags</span>
      </span>}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <FlagsList state={ctx.state} />
    </Dropdown.Menu>
  </Dropdown>
})
