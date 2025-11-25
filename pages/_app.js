import Head from 'next/head'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
