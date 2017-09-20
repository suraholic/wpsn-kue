require('dotenv').config()

const aws = require('aws-sdk')
const uuid = require('uuid')
const fileType = require('file-type')

const s3 = new aws.S3({
  apiVersion: '2006-03-01'
})

const supportedImageExt = ['png', 'jpg']

function uploadImageFile(buffer) {
  return new Promise((resolve, reject) => {
    const {ext, mime} = fileType(buffer)
    if (!supportedImageExt.includes(ext)) {
      // 함수를 바로 끝내기 위해 return
      return reject(new Error('지원하지 않는 파일 형식입니다.'))
    }
    s3.upload({
      ACL: 'public-read',
      Body: buffer,
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${uuid.v4()}.${ext}`,
      ContentDisposition: 'inline',
      ContentType: mime
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.Location)
      }
    })
  })
}

/**
 * 사용자로부터 받은 이미지 파일을 S3에 업로드합니다.
 * @param file - multer 파일 객체 https://www.npmjs.com/package/multer#file-information
 */
function uploadOriginalFile(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 1024 * 1024) {
      // 1MB 보다 크면 에러
      return reject(new Error('파일 크기가 1MB를 초과했습니다.'))
    }
    resolve(uploadImageFile(file.buffer))
  })
}

/**
 * 썸네일 생성 작업을 작업 큐에 추가합니다.
 * @param queue - kue queue 인스턴스
 * @param {string} location - S3에 업로드된 파일의 public url
 * @returns {Promise}
 */
function createThumbnailJob(queue, id) {
  return new Promise((resolve, reject) => {
    queue.create('thumbnail', {id})
      .removeOnComplete(true)
      .save(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
  })
}

module.exports = {
  createThumbnailJob,
  uploadOriginalFile,
  uploadImageFile
}
