import browser from 'webextension-polyfill'
import { getSafariProfileId } from './safari-profile'

export async function open(path, { width = 420, height = 600 } = {}) {
    let origin = { left: 0, top: 0, width: 0, height: 0 }
    try{
        origin = await browser.windows.getCurrent()
    } catch(_) {}

    //non-default safari profile: the web app instead of the local page (due to cookie issues)
    const base = await getSafariProfileId() ? 'https://app.raindrop.io' : '/index.html#'

    return await browser.windows.create({
        url: `${base}${path}`,
        type: 'popup',

        //position
        width,
        height,
        left: parseInt(origin.left + (origin.width/2) - (width/2)),
        top: parseInt(origin.top + (origin.height/2) - (height/2))
    })
}

export default function() {
}