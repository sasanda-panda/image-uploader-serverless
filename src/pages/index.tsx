import Auth from '@aws-amplify/auth'
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { listImages } from '../graphql/queries'
import { createImage, deleteImage } from '../graphql/mutations'
import { onCreateImage, onDeleteImage } from '../graphql/subscriptions'
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

  const attachSubscriptions = async () => {
    const createClient = API.graphql(graphqlOperation(onCreateImage, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ('subscribe' in createClient) {
      createClient.subscribe({
        next: (result: any) => {
          setImages((oldImages) => [result.value.data.onCreateImage, ...oldImages])
        }
      })
    }
    const deleteClient = API.graphql(graphqlOperation(onDeleteImage, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ('subscribe' in deleteClient) {
      deleteClient.subscribe({
        next: (result: any) => {
          setImages((oldImages) => oldImages.filter((image) => image.id !== result.value.data.onDeleteImage.id))
        }
      })
    }
  }

  useEffect(() => {
    fetchUser()
    fetchData()
    attachSubscriptions()
  }, [])

  const createItem = async (eve) => {
    try {
      const id = (Math.floor(Math.random() * 999999999999)).toString()
      const image = eve.target.files[0]
      const s3Image: any = await Storage.put(`${id}_${image.name}`, image, { contentType: image.type });
      const url = `https://${process.env.s3Bucket}.s3-${process.env.s3BucketRegion}.amazonaws.com/public/${s3Image.key}`;
      const withData = { input: { id, url } }
      await API.graphql(graphqlOperation(createImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const deleteItem = async (image: ImageType) => {
    try {
      await Storage.remove(image.url, { level: 'public' });
      const withData = { input: { id: image.id } }
      await API.graphql(graphqlOperation(deleteImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  return authenticatedUser ? (
    <div className={styles.home}>
      <div className={styles.home_head}>
        <div className={styles.home_form}>
          <input type="file" onChange={(eve) => createItem(eve)}/>
        </div>
      </div>
      <div className={styles.home_body}>
        <ul className={styles.home_images}>
          {images.map((image) => (
            <li key={image.id}>
              <img src={image.url} alt=""/>
              <button onClick={() => deleteItem(image)}>deleteItem</button>
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

// TODO:
// styleの調整