import wrapFunc from '../../utils/wrapFunc'
import {
	BOOKMARK_DRAFT_LOAD_REQ, BOOKMARK_DRAFT_CHANGE, BOOKMARK_DRAFT_COMMIT
} from '../../constants/bookmarks'

//Drafts
export const draftLoad = (_id, obj={}, config={})=>({
	type: BOOKMARK_DRAFT_LOAD_REQ,
	_id,
	obj,
	config
})

export const draftChange = (_id, changed)=>({
	type: BOOKMARK_DRAFT_CHANGE,
	_id,
	changed
})

export const draftCommit = (_id, onSuccess, onFail)=>({
	type: BOOKMARK_DRAFT_COMMIT,
	_id,
	onSuccess: wrapFunc(onSuccess),
	onFail: wrapFunc(onFail)
})