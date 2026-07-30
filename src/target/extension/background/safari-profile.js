import browser from 'webextension-polyfill'
import { environment } from '~target'

export async function getSafariProfileId() {
    if (!environment.includes('safari') || environment.includes('safari-ios'))
        return null

    try {
        const { profile_id } = await browser.runtime.sendNativeMessage('application.id', { type: 'profile_id' })
        return profile_id || null
    } catch(e) {
        return null
    }
}