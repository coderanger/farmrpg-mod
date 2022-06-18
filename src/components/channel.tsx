
import type { Channel, Message } from "../stores/channels"
import { observer } from 'mobx-react-lite'
import { useCallback, useContext, useEffect, useState } from 'react'
import CloseButton from 'react-bootstrap/CloseButton'

import { GlobalContext } from '../utils/context'
import { classNames } from '../utils/css'

const IMAGE_SRC_RE = /^(?:https:\/\/farmrpg.com)?\/?(.+)$/

interface MessageDivProps {
  msg: Message
}

const MessageDiv = observer(({msg}: MessageDivProps) => {
  const ctx = useContext(GlobalContext)
  const fixContent = useCallback((elm: HTMLDivElement | null) => {
    if (elm !== null) {
      elm.querySelectorAll("img").forEach(imgElm => {
        const src = imgElm.getAttribute("src")
        // Check if we need to rewrite things.
        if (src) {
          const match = src.match(IMAGE_SRC_RE)
          if (match) {
            imgElm.setAttribute("src", `https://farmrpg.com/${match[1]}`)
          }
        }
        // Check if we need to do some sizing stuff.
        if (imgElm.style.width || imgElm.style.height) {
          imgElm.style.objectFit = 'cover'
          if (!imgElm.style.width) {
            imgElm.style.width = '100%'
          }
          if (!imgElm.style.height) {
            imgElm.style.height = '100%'
          }
        } else {
          imgElm.style.objectFit = 'contain'
        }
      })
      elm.querySelectorAll("a").forEach(aElm => {
        const src = aElm.getAttribute("href")
        if (!src?.startsWith("https://")) {
          aElm.setAttribute("href", `https://farmrpg.com/index.php#!/${src}`)
        }
        aElm.setAttribute("target", "_blank")
      })
    }
  }, [msg.content])

  const isMention = !!(ctx.state?.auth.username && msg.mentions.includes(ctx.state?.auth.username))

  return <div className={classNames(
    "mb-2",
    {
      "bg-danger text-light": msg.deleted,
      "border border-info border-3 border-start-0": isMention,
      "bg-info": msg.focus,
    },
  )} css={{
    transition: "background-color 250ms"
  }} ref={msg.setElement}>
    <div className={`text-${msg.deleted ? "light" : "secondary"} fw-light fst-italic`}>{msg.ts.toDate().toLocaleString()}</div>
    <div className="fw-bold"><img src={`https://farmrpg.com/img/emblems/${msg.emblem}`} css={{height: 16, marginRight: 4}} />{msg.username}</div>
    <div
      ref={fixContent}
      dangerouslySetInnerHTML={{__html: msg.content}}
      css={{
        "& img": {
          height: 16,
        },
        wordWrap: "break-word",
      }}
    />
  </div>
})

interface MessageListProps {
  channel: Channel | null
}

const MessageList = observer(({channel}: MessageListProps) => {
  return <div className="h-100" css={{overflowY: "scroll"}}>
    {(channel?.messages || []).map(msg => (
      <MessageDiv key={msg.id} msg={msg} />
    ))}
  </div>
})

interface ChannelColumnProps {
  channelName: string
}

export const ChannelColumn = observer(({channelName}: ChannelColumnProps) => {
  const ctx = useContext(GlobalContext)
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    if (ctx.state?.channels && ctx.state.auth.loggedIn) {
      setChannel(ctx.state?.channels.listen(channelName))
      return () => ctx.state?.channels?.unlisten(channelName)
    }
  }, [channelName, ctx.db, ctx.state?.channels, ctx.state?.auth.loggedIn])

  return <div className="h-100 border-end border-4 overflow-hidden" css={{width: 400}}>
    <CloseButton className="float-end m-2" onClick={() => ctx.state?.settings.removeChannel(channelName)} />
    <div className="mb-2 text-center fs-2 fw-bold text-uppercase">{channelName}</div>
    {channel?.paused ? <div>Paused</div> : <MessageList channel={channel} />}
  </div>
})
