import Auth from '@aws-amplify/auth'
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { listImages } from '../graphql/queries'
import { createImage, updateImage, deleteImage } from '../graphql/mutations'
import { onCreateImage, onUpdateImage, onDeleteImage } from '../graphql/subscriptions'
import styles from '../styles/Home.module.scss'

type AuthenticatedUserType = {
  email: string,
  email_verified: boolean
}

type ImageType = {
  owner: string,
  id: string,
  url: string
}

const Home: NextPage = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType|null>(null)
  const [images, setImages] = useState<ImageType[]>([])

  const router = useRouter()

  const fetchUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      setAuthenticatedUser({ email: user.attributes.email, email_verified: user.attributes.email_verified })
    } catch (err) {
      console.log(err)
    }
  }

  const fetchData = async () => {
    try {
      const data: any = await API.graphql(graphqlOperation(listImages))
      setImages(data.data.listImages.items)
      console.log(data.data.listImages.items)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchData()
  }, [])

  const uploadImage = () => {
    // const S3image: any = await Storage.put(uuid(), image, {
    //   contentType: image.type,
    // });
  }

  const createItem = async () => {
    try {
      const id = 'id'
      const url = 'url'
      const withData = { input: { id, url } }
      await API.graphql(graphqlOperation(createImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const updateItem = async () => {
    try {
      const id = 'id'
      const url = 'url'
      const withData = { input: { id, url } }
      await API.graphql(graphqlOperation(updateImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const deleteItem = async () => {
    try {
      const id = 'id'
      const withData = { input: { id } }
      await API.graphql(graphqlOperation(deleteImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const onChange = async (eve) => {
    try {
      const id = (Math.floor(Math.random() * 999999999999)).toString()
      const image = eve.target.files[0]
      const S3image: any = await Storage.put(`${id}_${image.name}`, image, { contentType: image.type });
      const url = `https://${process.env.s3Bucket}.s3-${process.env.s3BucketRegion}.amazonaws.com/public/${S3image.key}`;
      const withData = { input: { id, url } }
      await API.graphql(graphqlOperation(createImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  return authenticatedUser ? (
    <div className={styles.home}>
      <div className={styles.home_head}>
        <div className={styles.home_form}>
          <input type="file" onChange={onChange}/>
        </div>
      </div>
      <div className={styles.home_body}>
        <ul className={styles.home_images}>
          {images.map((image) => (
            <li key={image.id}>
              <img src={image.url} alt=""/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <div className={styles.home}>

    </div>
  )
}

export default Home




// import Head from 'next/head'
// import styles from '../styles/Home.module.scss'

// export default function Home() {
//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Create Next App</title>
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className={styles.main}>
//         <h1 className={styles.title}>
//           Welcome to <a href="https://nextjs.org">Next.js!</a>
//         </h1>

//         <p className={styles.description}>
//           Get started by editing{' '}
//           <code className={styles.code}>pages/index.js</code>
//         </p>

//         <div className={styles.grid}>
//           <a href="https://nextjs.org/docs" className={styles.card}>
//             <h3>Documentation &rarr;</h3>
//             <p>Find in-depth information about Next.js features and API.</p>
//           </a>

//           <a href="https://nextjs.org/learn" className={styles.card}>
//             <h3>Learn &rarr;</h3>
//             <p>Learn about Next.js in an interactive course with quizzes!</p>
//           </a>

//           <a
//             href="https://github.com/vercel/next.js/tree/master/examples"
//             className={styles.card}
//           >
//             <h3>Examples &rarr;</h3>
//             <p>Discover and deploy boilerplate example Next.js projects.</p>
//           </a>

//           <a
//             href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className={styles.card}
//           >
//             <h3>Deploy &rarr;</h3>
//             <p>
//               Instantly deploy your Next.js site to a public URL with Vercel.
//             </p>
//           </a>
//         </div>
//       </main>

//       <footer className={styles.footer}>
//         <a
//           href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Powered by{' '}
//           <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
//         </a>
//       </footer>
//     </div>
//   )
// }
