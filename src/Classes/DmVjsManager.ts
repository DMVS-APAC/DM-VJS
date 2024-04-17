import DomHelper from "../Libraries/DomHelper";
export default class DmVjsManager {
  private parentEl: HTMLDivElement = null
  private iframe: HTMLIFrameElement = null
  constructor(parentEl: HTMLDivElement) {
    this.parentEl = parentEl
    this.buildIframe()
  }

  private buildIframe(): void {
    const loadContent = ""
    const iframe = DomHelper.createElement('iframe', 'dm-vjs-iframe', [{name: "width", value: "100%"}, {name: "height", value: "100%"}, {name: "title", value: "Dailymotion player"}, {name: "src", value: loadContent}]) as HTMLIFrameElement

    DomHelper.append(this.parentEl, iframe)
  }

}