import DmVideoManager from "../Classes/DmVideoManager"

const elements = document.getElementsByClassName('dm-vjs');
for (let i: number = 0; i < elements.length; i++) {
  const el = elements[i];
  new DmVideoManager(el as HTMLScriptElement)
}