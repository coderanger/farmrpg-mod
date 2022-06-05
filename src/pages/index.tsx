import { signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'

import { ChannelColumn } from '../components/channel'
import Layout from '../components/layout'
import { GlobalContext } from '../utils/context'

const IndexPage = observer(() => {
  const ctx = useContext(GlobalContext)
  // const [rooms, setRooms] = useState<string[]>([])

  // useEffect(() => {
  //   if (ctx.db && ctx.user && !ctx.user.isAnonymous) {
  //     const newRooms: string[] = []
  //     getDocs(collection(ctx.db, "rooms")).then(resp => {
  //       for (const doc of resp.docs) {
  //         newRooms.push(doc.id)
  //       }
  //       setRooms(newRooms)
  //     }).catch(console.error)

  //   }
  // }, [ctx.db, ctx.user])

  return (
    <Layout>
      <div className="d-flex gap-3">
        <div>
          TODO: This should be a toolbar.
          <div>Welcome {ctx.user?.email}</div>
          <div><Button onClick={() => signOut(ctx.auth!)}>Sign out</Button></div>
        </div>
        <ChannelColumn channelName="help" />
        <ChannelColumn channelName="global" />
        <ChannelColumn channelName="spoilers" />
      </div>
    </Layout>
  )
})

export default IndexPage
