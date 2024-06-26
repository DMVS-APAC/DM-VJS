import videojs, { VideoJsPlayer } from "video.js"
import { fetchData } from "../Libraries/FetchHelper"
import "video.js/dist/video-js.min.css"
import "../Styles/Vjs.scss"
import 'url-search-params-polyfill'

export default class DmPlayerManager {
  private playerContainer: HTMLVideoElement = null
  private videoId: string = null
  private videoFormat: string = null

  constructor(el: HTMLVideoElement) {
    this.playerContainer = el
    this.getParams()
    this.renderPlayer()
  }

  getParams(): void {
    // Create a URLSearchParams object from the current URL's query string
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    this.videoId = params.get('video-id')
    this.videoFormat = params.get('video-format')
  }

  getRootUrl(): string {
    // Get the protocol, hostname, and port from the window.location object
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Construct the root URL
    let rootUrl = `${protocol}//${hostname}`;
    if (port && port !== "80" && port !== "443") { // Check if port is non-standard
      rootUrl += `:${port}`;
    }

    return rootUrl + '/api/get-stream-url';
  }

  async fetchStreamUrl(): Promise<any> {
    const rootUrl: string = this.getRootUrl()
    try {
      return await fetchData(rootUrl + '?videoid=' + this.videoId + '&videoformats=' + this.videoFormat)
    } catch (err) {
      return err
    }
  }

  private renderPlayer(): void {
    const player: VideoJsPlayer = videojs(this.playerContainer, {
      controls: true,
      autoplay: 'muted',
      preload: 'auto'
    })

    player.ready(async () => {
      const json = await this.fetchStreamUrl()

      // @ts-ignore
      const bigButton = player.bigPlayButton

      // Additional event for big play button. because this play button is only to play at first time loaded
      bigButton.on('click', e => {
        // @ts-ignore
        if (player.el_.classList.contains('vjs-playing')) {
          player.pause()
        }
      })

      if (json.status == 403) {
        player.error(json)
      } else {
        player.src({
          type: 'video/mp4',
          src: json.stream_h264_hq_url
        })
      }
      // player.play()
    });
  }

}