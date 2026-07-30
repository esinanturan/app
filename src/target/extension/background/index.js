import action from './action'
import commands from './commands'
import contextMenus from './contextMenus'
import links from './links'
import omnibox from './omnibox'
import runtime from './runtime'
import highlights from './highlights'
import popup from './popup'
import fixSafariProfileCookies from './fix-safari-profile-cookies'

action()
commands()
contextMenus()
omnibox()
links()
runtime()
highlights()
popup()
//fix-safari-permissions retired: its permissions.remove(origins: *://*/*) wiped
//the host grants fix-safari-profile-cookies depends on
fixSafariProfileCookies()