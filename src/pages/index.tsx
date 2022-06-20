import { signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'

import { ChannelColumn } from '../components/channel'
import Layout from '../components/layout'
import { GlobalContext } from '../utils/context'

const ChannelColumnList = observer(() => {
  const ctx = useContext(GlobalContext)
  return <>
    {ctx.state.settings.channels.map(chan =>
      <ChannelColumn channelName={chan} key={chan} />
    )}
    {ctx.state.settings.channels.length === 0 && <div>Use the + button in the sidebar to add some channels.</div>}
  </>
})

const IndexPage = observer(() => {
  const ctx = useContext(GlobalContext)

  useEffect(() => {
    if (ctx.state) {
      return autorun(() => {
        if (ctx.state.ui.isIdle) {
          ctx.state.channels.pause()
          ctx.state.mentions.pause()
        } else {
          ctx.state.channels.resume()
          ctx.state.mentions.resume()
        }
      })
    }
  }, [ctx.state])

  return (
    <Layout>
      <div className="d-flex gap-3">
        <ChannelColumnList />
      </div>
    </Layout>
  )
})

export default IndexPage
