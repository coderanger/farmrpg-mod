
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
        aElm.setAttribute("href", `https://farmrpg.com${src}`)
      })
    }
  }, [msg.content])

  return <div className="mb-2">
    <div className="text-secondary fw-light fst-italic">{msg.ts.toDate().toLocaleString()}</div>
    <div className="fw-bold"><img src={`https://farmrpg.com/img/emblems/${msg.emblem}`} css={{height: 16, marginRight: 4}} />{msg.username}</div>
    <div
      ref={fixContent}
      dangerouslySetInnerHTML={{__html: msg.content}}
      css={{
        "& img": {
          height: 16,
        },
      }}
    />
  </div>
})

interface MessageListProps {
  channel: Channel | null
}

const MessageList = observer(({channel}: MessageListProps) => {
  return <div>
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
    if (ctx.channels && ctx.user && !ctx.user.isAnonymous) {
      setChannel(ctx.channels.listen(channelName))
      return () => ctx.channels?.unlisten(channelName)
    }
  }, [channelName, ctx.db, ctx.channels])

  return <div css={{width: 400, height: "100%"}}>
    <MessageList channel={channel} />
    <div>{channelName}</div>
  </div>
})
