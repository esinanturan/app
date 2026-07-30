import browser from 'webextension-polyfill'
import { has } from './links'
import { currentTab } from '~target'
import { getSafariProfileId } from './safari-profile'
import { open } from './popup'

let icon = unescape('%u2713') //✓, glitchy without escape in safari

export async function updateBadge() {
    const { url, id: tabId } = await currentTab()
    if (!url) return

    await Promise.all([
        browser.action.setBadgeBackgroundColor({tabId, color: '#0087EA'}),
        browser.action.setBadgeText({tabId, text: has(url) ? icon : ''}),

        ...(typeof browser.action.setBadgeTextColor == 'function' ? [
            browser.action.setBadgeTextColor({tabId, color: '#FFFFFF'})
        ] : []),
    ])
}

async function onTabsUpdated(id, details = {}) {
    if (details?.status == 'complete')
        await updateBadge()
}

function onClickedAsPopup(tab) {
    if (tab?.url)
        return open(`/add?link=${encodeURIComponent(tab.url)}`)
}

export default async function() {
    browser.tabs.onUpdated.removeListener(onTabsUpdated)
    browser.tabs.onUpdated.addListener(onTabsUpdated)

    browser.tabs.onActivated.removeListener(updateBadge)
    browser.tabs.onActivated.addListener(updateBadge)

    //non default safari profiles do not work properly, replace with direct app open
    if (await getSafariProfileId()) {
        await browser.action.setPopup({ popup: '' })
        browser.action.onClicked.removeListener(onClickedAsPopup)
        browser.action.onClicked.addListener(onClickedAsPopup)
    }
}