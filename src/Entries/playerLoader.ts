import DmPlayerManager from "../Classes/DmPlayerManager"

// const dmVjsPlayer: HTMLVideoElement = document.querySelector('#dm-vjs-player')
const dmVjsPlayer: HTMLVideoElement = document.getElementById('dm-vjs-player') as HTMLVideoElement
new DmPlayerManager(dmVjsPlayer)
