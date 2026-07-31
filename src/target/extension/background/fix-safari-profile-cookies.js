import browser from 'webextension-polyfill'
import { environment } from '~target'
import { API_ENDPOINT_URL } from '~data/constants/app'

const RULE_ID = 100

async function getSafariProfileId() {
    if (!environment.includes('safari') || environment.includes('safari-ios'))
        return null

    try {
        const { profile_id } = await browser.runtime.sendNativeMessage('application.id', { type: 'profile_id' })
        return profile_id || null
    } catch(e) {
        return null
    }
}

async function sync() {
    //shared legacy store, never lists tabs
    const storeId = (await browser.cookies.getAllCookieStores())
        .find(({ tabIds }) => tabIds?.length)?.id
    if (!storeId) return

    const { protocol, hostname } = new URL(API_ENDPOINT_URL)
    const APEX_URL = `${protocol}//${hostname.split('.').slice(-2).join('.')}/`

    //both queries can return the same cookie (e.g. parent-domain ones)
    const cookies = [
        ...await browser.cookies.getAll({ url: APEX_URL, storeId }),
        ...await browser.cookies.getAll({ url: API_ENDPOINT_URL, storeId })
    ]

    await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_ID],

        ...(cookies.length ? {
            addRules: [{
                id: RULE_ID,
                priority: 1,
                condition: {
                    initiatorDomains: [
                        //uuid rotates on reinstall; non-special scheme keeps hostname case, DNR needs lowercase
                        new URL(browser.runtime.getURL('')).hostname.toLowerCase()
                    ],
                    urlFilter: '|' + API_ENDPOINT_URL
                },
                action: {
                    type: 'modifyHeaders',
                    requestHeaders: [{
                        header: 'Cookie',
                        operation: 'set',
                        value: [...new Set(
                            cookies.map(({ name, value }) => `${name}=${value}`)
                        )].join('; ')
                    }]
                }
            }]
        } : {})
    })
}

function ping() {
    sync().catch(console.error)
}

//fix cookies in non default Safari profiles (they are broken)
export default async function() {
    if (!browser.cookies || !browser.declarativeNetRequest) return
    if (!await getSafariProfileId()) return

    ping()

    browser.cookies?.onChanged?.removeListener(ping)
    browser.cookies?.onChanged?.addListener(ping)

    browser.permissions?.onAdded?.removeListener(ping)
    browser.permissions?.onAdded?.addListener(ping)

    browser.runtime.onMessage.removeListener(ping)
    browser.runtime.onMessage.addListener(ping)
}