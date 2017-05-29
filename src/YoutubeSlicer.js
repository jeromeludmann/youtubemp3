import fs from 'fs'
import path from 'path'
import url from 'url'
import EventEmitter from 'events'
import rimraf from 'rimraf'

import { downloadFromYoutube } from './download'
import { encodeToMp3 } from './encode'

export default class YoutubeSlicer extends EventEmitter {
  constructor(output = '', videos = []) {
    super(output, videos)
    this.output = output.trim()
    this.videos = videos
  }

  async run() {
    let youtubeId = null
    let downloadedFile = null

    try {
      if (!fs.existsSync(this.output)) {
        fs.mkdirSync(this.output)
      }

      for (const video of this.videos) {
        video.url = video.url.trim()

        // 'youtubeId' is used as a key to identify the different slices
        // if we decide to parallelize the Youtube calls in the next releases.
        youtubeId = this.getIdFromYoutubeUrl(video.url)

        downloadedFile = await downloadFromYoutube({
          key: youtubeId,
          url: video.url,
          target: path.resolve(this.output, 'tmp', `youtube_${youtubeId}.%(ext)s`)
        }, (key, outputLine) => this.emit('downloading', key, outputLine))

        this.emit('downloaded', youtubeId, downloadedFile)

        const encodedFiles = []

        // in all cases, we create at least one slice with default tags
        if (video.slices.length === 0) {
          const defaultSlice = {}
          defaultSlice.tags = video.tags
          video.slices.push(defaultSlice)
        }

        const timestamp = Date.now()

        for (const k in video.slices) {
          const slice = video.slices[k]

          // avoid specifying "end" if the next "start" value is the same
          if (slice.end === 'next') {
            if (k < video.slices.length - 1) {
              slice.end = video.slices[Number(k) + 1].start
            } else {
              delete slice.end
            }
          }

          // inherit tags from related video if needed
          if (!slice.tags) {
            slice.tags = {}
          }
          slice.tags.artist = slice.tags.artist || video.tags.artist
          slice.tags.album = slice.tags.album || video.tags.album
          slice.tags.title = slice.tags.title || video.tags.title

          slice.tags.track = Number(k) + 1

          encodedFiles.push(await encodeToMp3({
            key: youtubeId,
            sourceFile: downloadedFile,
            quality: video.quality,
            slice,
            target: path.resolve(this.output, `youtube_${youtubeId}_${timestamp}`)
          }, (key, outputLine) => this.emit('encoding', key, outputLine)))
        }

        this.emit('encoded', youtubeId, encodedFiles)
      }
    } catch (err) {
      this.emit('error', youtubeId, err)
    } finally {
      // Remove temporary folder
      rimraf(path.resolve(this.output, 'tmp'), () => {
        console.log('tmp removed')
      })
    }
  }

  getIdFromYoutubeUrl(youtubeUrl) {
    return youtubeUrl.includes('youtu.be')
      ? url.parse(youtubeUrl, false).pathname.slice(1)
      : url.parse(youtubeUrl, true).query.v
  }
}
