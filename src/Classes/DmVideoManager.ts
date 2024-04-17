import DomHelper from "../Libraries/DomHelper";
import "../Styles/DmVideo.scss";

export default class DmVideoManager {
  private scriptContainer: HTMLScriptElement = null
  private playerContainer: HTMLDivElement = null
  private originalSrc: string = null
  private videoId: string = null
  private videoFormat: string = null

  constructor(el: HTMLScriptElement) {
    this.scriptContainer = el
    this.videoId = el.getAttribute('video-id')
    this.videoFormat = el.getAttribute('video-format') ? el.getAttribute('video-format') : 'stream_live_hls_url'
    this.originalSrc = this.getCurrentScriptPath(el)
    this.renderHtml()
  }

  private getCurrentScriptPath(script) {
    let currentScript = script.src
    let currentScriptChunks = currentScript.split('/')
    currentScriptChunks.pop()

    return currentScriptChunks.join('/')
  }

  private renderHtml() {
    // Create a new div element and replace `script` tag
    this.playerContainer = DomHelper.createElement('div', 'dm-vjs') as HTMLDivElement
    this.scriptContainer.parentNode.replaceChild(this.playerContainer, this.scriptContainer)
    const queryString: string = "?video-id=" + this.videoId + "&video-format=" + this.videoFormat

    this.buildIframe(queryString)
  }

  private buildIframe(queryString: string): void {
    const loadContent: string = this.originalSrc + "/dm-player.html" + queryString
    const iframe: HTMLIFrameElement = DomHelper.createElement('iframe', 'dm-vjs-iframe', [
      {name: "width", value: "100%"},
      {name: "height", value: "100%"},
      {name: "title", value: "Dailymotion player"},
      {name: "src", value: loadContent}
    ]) as HTMLIFrameElement

    DomHelper.append(this.playerContainer, iframe)
  }

}