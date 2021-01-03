import Auth from '@aws-amplify/auth'
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
import { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters, AiOutlineDelete } from 'react-icons/ai'
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
  key: string
}

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType|null>(null)
  const [images, setImages] = useState<ImageType[]>([])

  const router = useRouter()

  const fetchUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      setAuthenticatedUser({ email: user.attributes.email, email_verified: user.attributes.email_verified })
    } catch (err) {
      router.push('/profile')
    }
  }

  const fetchData = async () => {
    try {
      const data: any = await API.graphql(graphqlOperation(listImages))
      setImages(data.data.listImages.items.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()))
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

  const createItem = async (image: any) => {
    try {
      setIsLoading(true)
      const id = Math.floor(Math.random() * 999999999999)
      const exception = image.name.split('.')[1]
      const key = `${id}.${exception}`
      const withData = { input: { id, key } }
      await Storage.put(key, image, { contentType: image.type })
      await API.graphql(graphqlOperation(createImage, withData))
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.log(err)
    }
  }

  const deleteItem = async (image: ImageType) => {
    try {
      const withData = { input: { id: image.id } }
      await Storage.remove(image.key, { level: 'public' });
      await API.graphql(graphqlOperation(deleteImage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const onDragOver = (eve) => {
    eve.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (eve) => {
    eve.preventDefault()
    setIsDragging(false)
  }
  
  const onDrop = (eve) => {
    eve.preventDefault()
    setIsDragging(false)
    createItem(eve.dataTransfer.files[0])
  }

  const onChange = (eve) => {
    createItem(eve.target.files[0])
  }

  return authenticatedUser ? (
    <div className={styles.home}>
      <div className={styles.home_head}>
        <div className={`${styles.home_form} ${isDragging ? styles.home_form_dragging : ''} ${isLoading ? styles.home_form_loading : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <p>{isDragging ? 'Dragging an image' : 'Drag and drop an image here'}</p>
          <input type="file" accept="image/*" onChange={onChange}/>
          <div className={styles.home_form_info}>
            <p><AiOutlineLoading3Quarters /></p>
          </div>
        </div>
      </div>
      <div className={styles.home_body}>
        <ul className={styles.home_images}>
          {images.map((image) => (
            <li className={styles.home_image} key={image.id}>
              <img src={`https://${process.env.s3Bucket}.s3-${process.env.s3BucketRegion}.amazonaws.com/public/${image.key}`} alt=""/>
              <div className={styles.home_image_info}>
                <button onClick={() => deleteItem(image)}><AiOutlineDelete /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <div className={styles.home}></div>
  )
}

export default Home

// TODO:
// styleの調整