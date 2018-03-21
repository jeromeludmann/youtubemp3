# youtube-to-mp3

Youtube downloader/MP3 encoder wrapper using [youtube-dl](https://github.com/rg3/youtube-dl/) and [ffmpeg](https://ffmpeg.org/).

Get and slice MP3 (audio only) from Youtube videos.

## Install

```
npm install -g jeromeludmann/youtube-to-mp3
```

## Command line interface

Show help:
```
youtube-to-mp3 --help
```

Download the entire track in the current directory from the given Youtube URL:
```
youtube-to-mp3 --url https://www.youtube.com/watch?v=XXXXX
```
You can also specify an output directory like this:
```
youtube-to-mp3 --url https://www.youtube.com/watch?v=XXXXX --output $HOME/Desktop/
```

## API usage

**Will be changed in the next release.**

The easier way:

```javascript
import YoutubeToMP3 from './YoutubeToMP3'

const youtubeToMp3 = new YoutubeToMP3(
  {
    // set the output folder
    // it will be created if needed
    output: '/music/',

    // the video you want to extract (without other settings)
    videoUrl: 'https://www.youtube.com/watch?v=XXXXX'
)
```

Advanced way:

```javascript
import YoutubeToMP3 from './YoutubeToMP3'

const youtubeToMp3 = new YoutubeToMP3(
  {
    // set the output folder
    // it will be created if needed
    output: '/music/',
    
    // all the Youtube sounds you want to extract
    videos: [
      // the simple use case
      {
        // the Youtube URL video (required)
        url: 'https://www.youtube.com/watch?v=XXXXX'
      },

      // another simple case with some optional parameters
      {
        url: 'https://www.youtube.com/watch?v=YYYYY',

        // MP3 encoding quality (optional)
        // default: 320k
        quality: '256k',

        // override the default tags (optional)
        // by default, it will extract the Youtube video tags
        // no effects with a given slices[] attribute
        tags: {
          artist: 'XXXXX',
          album: 'YYYYY',
          title: 'ZZZZZ'
        }
      },

      // advanced use with given slices
      {
        url: 'https://www.youtube.com/watch?v=ZZZZZ',

        // default tags used by following slices
        tags: {
          artist: 'XXXXX',
          album: 'YYYYY'
        },

        // all the parts you want to slice (optional)
        slices: [
          // first slice
          {
            // the start of the slice (optional)
            // default: start of the video
            start: '00:00:00',

            // the end of this slice (optional)
            // 'next' reference the start value of the next slice
            // default: end of the video
            end: 'next'
          },

          // second slice
          {
            start: '00:01:23',
            end: '00:02:34',
            
            // rewrite the tags for this slice (optional)
            // inherit from default tags
            tags: {
              title: 'ZZZZZ'
            }
          },
          
          // ... all the other slices you want
        ]
      },

      // ... and all the other Youtube sounds you need
    ]
  }
)
```

and handle events as usual:

```javascript
youtubeToMp3.on('downloading', (videoId, outputLine) => {
  console.log(`Downloading Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeToMp3.on('encoding', (videoId, outputLine) => {
  console.log(`Encoding Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeToMp3.on('downloaded', (videoId, success) => {
  console.log(`Youtube video ID ${videoId} downloaded with success`)
})

youtubeToMp3.on('encoded', (videoId, success) => {
  console.log(`Youtube video ID ${videoId} encoded with success`)
})

youtubeToMp3.on('error', (videoId, err) => {
  console.error(err)
})

youtubeToMp3.run()
```
