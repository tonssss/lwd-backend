import { Controller } from 'egg'
import * as sharp from 'sharp'
import * as sendToWormhole from 'stream-wormhole'
import * as Busboy from 'busboy'
import { nanoid } from 'nanoid'
import { createWriteStream } from 'fs'
import { parse, join, extname } from 'path'
import { pipeline } from 'stream/promises'
import { FileStream } from '../../typings/app'

export default class UtilsController extends Controller {
  splitIdAndUuid(str = '') {
    const result = { id: '', uuid: '' }
    if (!str) return result
    const firstDashIndex = str.indexOf('-')
    if (firstDashIndex < 0) return result
    result.id = str.slice(0, firstDashIndex)
    result.uuid = str.slice(firstDashIndex + 1)
    return result
  }
  async renderH5Page() {
    // id-uuid split('-')
    // uuid = aa-bb-cc
    const { ctx, app } = this
    const { idAndUuid } = ctx.params
    const query = this.splitIdAndUuid(idAndUuid)
    try {
      const pageData = await this.service.utils.renderToPageData(query)
      await ctx.render('page.nj', pageData)
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'h5WorkNotExistError' })
    }
  }
  async uploadToOSS() {
    const { ctx } = this
    const stream = await ctx.getFileStream()
    const savedOSSPath = (join('lwd-test', nanoid(6) + extname(stream.filename))).replace(/\\/g, '\/')
    try {
      const result = await ctx.oss.put(savedOSSPath, stream)
      const { name, url } = result
      ctx.helper.success({ ctx, res: { name, url } })
    } catch (e) {
      await sendToWormhole(stream)
      ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
    }
  }
  async uploadMutipleFiles() {
    const { ctx, app } = this
    const { fileSize } = app.config.multipart
    const parts = ctx.multipart({ limits: { fileSize: fileSize as number } })
    const urls: string[] = []
    let part: FileStream | string[]
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        app.logger.info(part)
      } else {
        try {
          const savedOSSPath = (join('lwd-test', nanoid(6) + extname(part.filename))).replace(/\\/g, '\/')
          const result = await ctx.oss.put(savedOSSPath, part)
          const { url } = result
          urls.push(url)
          if (part.truncated) {
            await ctx.oss.delete(savedOSSPath)
            return ctx.helper.error({ ctx, errorType: 'imageUploadFileSizeError', error: `Reach fileSize limit ${fileSize} bytes` })
          }
        } catch (e) {
          await sendToWormhole(part)
          ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } })
  }
  uploadFileUseBusBoy() {
    const { ctx, app } = this
    return new Promise<string []>(resolve => {
      const busboy = new Busboy({ headers: ctx.req.headers as any })
      const result: string[] = []
      busboy.on('file', (fieldname, file, filename) => {
        app.logger.info(fieldname, file, filename)
        const uid = nanoid(6)
        const savedFilePath = join(app.config.baseDir, 'uploads', uid + extname(filename))
        file.pipe(createWriteStream(savedFilePath))
        file.on('end', () => {
          result.push(savedFilePath)
        })
      })
      busboy.on('field', (fieldname, val) => {
        app.logger.info(fieldname, val)
      })
      busboy.on('finish', () => {
        app.logger.info('finished')
        resolve(result)
      })
      ctx.req.pipe(busboy)
    })
  }
  async testBugBoy() {
    const { ctx, app } = this
    const results = await this.uploadFileUseBusBoy()
    ctx.helper.success({ ctx, res: results })
  }
  async fileLocalUpload() {
    const { ctx, app } = this
    const { filepath } = ctx.request.files[0]
    // 生成 sharp 实例
    const imageSource = sharp(filepath)
    const metaData = await imageSource.metadata()
    let thumbnailUrl = ''
    // 检查图片宽度是否大于300
    if (metaData.width && metaData.width > 300) {
      // generate a new file path
      const { name, ext, dir } = parse(filepath)
      const thumbnailFilePath = join(dir, `${name}-thumbnail${ext}`)
      await imageSource.resize({ width: 300 }).toFile(thumbnailFilePath)
      thumbnailUrl = thumbnailFilePath.replace(app.config.baseDir, app.config.baseUrl)
    }
    const url = filepath.replace(app.config.baseDir, app.config.baseUrl)
    ctx.helper.success({ ctx, res: { url, thumbnailUrl: thumbnailUrl ? thumbnailUrl : url } })
  }
  pathToURL(path: string) {
    const { app } = this
    return path.replace(app.config.baseDir, app.config.baseUrl)
  }
  async fileUploadByStream() {
    const { ctx, app } = this
    const stream = await ctx.getFileStream()
    // uploads/***.ext
    const uid = nanoid(6)
    const savedFilePath = join(app.config.baseDir, 'uploads', uid + extname(stream.fieldname))
    const savedThumbnailPath = join(app.config.baseDir, 'uploads', uid + '_thumbnail' + extname(stream.fieldname))
    const target = createWriteStream(savedFilePath)
    const target2 = createWriteStream(savedThumbnailPath)
    const savePromise = pipeline(stream, target)
    const transformer = sharp().resize({ width: 300 })
    const thumbnailPromise = pipeline(stream, transformer, target2)
    try {
      await Promise.all([ savePromise, thumbnailPromise ])
    } catch (e) {
      return ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
    }
    ctx.helper.success({ ctx, res: { url: this.pathToURL(savedFilePath), thumbnailUrl: this.pathToURL(savedThumbnailPath) } })
  }
}
