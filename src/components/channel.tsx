
import type { Channel, Message } from "../stores/channels"
import { observer } from 'mobx-react-lite'
import { useCallback, useContext, useEffect, useState } from 'react'

import { GlobalContext } from '../utils/context'

interface MessageDivProps {
  msg: Message
}

const MessageDiv = observer(({msg}: MessageDivProps) => {
  const fixContent = useCallback((elm: HTMLDivElement | null) => {
    if (elm !== null) {
      elm.querySelectorAll("img").forEach(imgElm => {
        const src = imgElm.getAttribute("src")
        imgElm.setAttribute("src", `https://farmrpg.com${src}`)
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

  return <div className={`mb-2 ${msg.deleted ? "bg-danger text-light" : ""}`}>
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
    if (ctx.state?.channels && ctx.user && !ctx.user.isAnonymous) {
      setChannel(ctx.state?.channels.listen(channelName))
      return () => ctx.state?.channels?.unlisten(channelName)
    }
  }, [channelName, ctx.db, ctx.state?.channels])

  return <div className="h-100 border-end border-4" css={{width: 400}}>
    <div className="mb-2 text-center fs-2 fw-bold text-uppercase">{channelName}</div>
    {channel?.paused ? <div>Paused</div> : <MessageList channel={channel} />}
  </div>
})
