# Image Uploader

## Flow

- Next.jsアプリを作成する
```
yarn create next-app image-uploader-serverless
```

- プロジェクトフォルダへ移動する
```
cd image-uploader-serverless
```

- 必要なモジュールをインストールする
```
yarn add node-sass@4.14.1 @aws-amplify/core @aws-amplify/auth @aws-amplify/api @aws-amplify/pubsub @aws-amplify/storage
yarn add -D @types/node @types/react @types/react-dom typescript
```

- package.jsonのコマンドを変更する
```
"build": "next build",
```
```
"build": "next build && next export",
```

- 調整する

- Amplifyを追加する
```
amplify init
```
Source Directory Path: `src`  
Distribution Directory Path: `out`

- Authを追加する
```
amplify add auth
```
Do you want to use the default authentication and security configuration? `Default configuration`  
How do you want users to be able to sign in? `Email`  
Do you want to configure advanced settings? `No, I am done.`

- Authをプッシュする
```
amplify push --y
```

- Apiを追加する (GraphQL)
```
amplify add api
```
Please select from one of the below mentioned services: `GraphQL`  
Provide API name: `imageUploaderApi`  
Choose the default authorization type for the API `Amazon Cognito User Pool`  
Do you want to configure advanced settings for the GraphQL API `No, I am done.`  
Do you have an annotated GraphQL schema? `No` 
Choose a schema template: `Single object with fields (e.g., “Todo” with ID, name, description)`  
Do you want to edit the schema now? `Yes`

- スキーマを変更する
```
# schema.graphql
type Image @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  url: String!
}
```

- Apiをプッシュする
初回以降はapiを自動でupdateするかどうか聞かれる。
apiを編集している場合は気をつける(2敗)
```
amplify push
```

- Storageを追加する
```
amplify add storage
```
Please provide a friendly name for your resource that will be used to label this category in the project: `imageUploaderStorage`  
Please provide bucket name: `imageuploaderbucketxxxxxxxxxxxxxxxxxxxxx`  
Who should have access: `Auth users only`  
What kind of access do you want for Authenticated users? `create/update, read, delete`  

-----


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
