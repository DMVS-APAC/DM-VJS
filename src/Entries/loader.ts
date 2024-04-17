import DmVideoManager from "../Classes/DmVideoManager"

document.querySelectorAll('.dm-vjs').forEach( el => {
  new DmVideoManager(el as HTMLScriptElement)
})
