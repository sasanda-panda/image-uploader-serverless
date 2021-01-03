import Amplify from '@aws-amplify/core'
import API from '@aws-amplify/api'
import Pubsub from '@aws-amplify/pubsub'
import awsconfig from '../aws-exports'
import { AppProps } from 'next/app'
import Link from 'next/link'
import '../styles/globals.scss'
import { AiOutlineHome, AiOutlineUser } from 'react-icons/ai'

Amplify.configure(awsconfig)
API.configure(awsconfig)
Pubsub.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="navigation">
        <ul>
          <li><Link href="/"><div><AiOutlineHome /></div></Link></li>
          <li><Link href="/profile"><div><AiOutlineUser /></div></Link></li>
        </ul>
      </nav>
      <div className="container">
        <Component {...pageProps} />
      </div>
      </>
  )
}

export default MyApp
