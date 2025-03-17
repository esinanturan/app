import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import Api from '../../modules/api'
import { removeCollection } from './single'
import _ from 'lodash-es'

import {
	COLLECTIONS_LOAD_PRE, COLLECTIONS_LOAD_REQ, COLLECTIONS_LOAD_SUCCESS, COLLECTIONS_LOAD_ERROR,
	COLLECTIONS_REFRESH_REQ,
	COLLECTIONS_TOGGLE_ALL,
	COLLECTIONS_REORDER,
	COLLECTIONS_REMOVE_ALL,
	COLLECTIONS_CLEAN_REQ,
	COLLECTIONS_CLEAN_SUCCESS,
	COLLECTIONS_CLEAN_ERROR,
	COLLECTIONS_CHANGE_VIEW,

	COLLECTION_DRAFT_LOAD_REQ
} from '../../constants/collections'

//Requests
export default function* () {
	//items, takeEvery is important here!
	yield takeEvery([ COLLECTIONS_LOAD_PRE, COLLECTIONS_REFRESH_REQ ], preLoadCollections)
	yield takeEvery([ COLLECTIONS_LOAD_REQ, COLLECTION_DRAFT_LOAD_REQ ], loadCollections)

	yield takeEvery(COLLECTIONS_TOGGLE_ALL, toggleAll)
	yield takeEvery(COLLECTIONS_REORDER, reorderAll)
	yield takeEvery(COLLECTIONS_CHANGE_VIEW, changeView)

	yield takeEvery(COLLECTIONS_REMOVE_ALL, removeAllCollections)
	yield takeEvery(COLLECTIONS_CLEAN_REQ, clean)
}

function* preLoadCollections({ ignore=false }) {
	if (ignore) return

	yield put({
		type: COLLECTIONS_LOAD_REQ,
	})
}

export function* loadCollections({ ignore=false, onSuccess, onFail }) {
	if (ignore) return

	try {
		//Load Get
		const [collections, stat={}, { user }] = yield all([
			call(Api.get, 'collections/all'),
			call(Api.get, 'user/stats'),
			call(Api.get, 'user')
		])

		//Prepare default collections
		const state = yield select()
		const defColls = state.collections.defaults.map((item)=>{
			var count = 0
			// var view = user?.config?.default_collection_view || 'list'
			
			//count
			if (stat.items){
				const statIndex = (stat.items||[]).findIndex((a)=>a._id==item._id)
				if (statIndex!=-1)
					count = stat.items[statIndex].count
			}
			
			return item
				.set('count', count)
				// .set('view', view)
		})

		yield put({
			type: COLLECTIONS_LOAD_SUCCESS, 
			items: [
				...defColls,
				...collections.items||[],
			],
			groups: user?.groups||[],
			user,
			onSuccess,
			onFail
		});
	} catch (error) {
		yield put({ type: COLLECTIONS_LOAD_ERROR, error, onSuccess, onFail });
	}
}

function* toggleAll({ ignore=false, expanded=false }){
	if (ignore) return

	yield call(Api.put, 'collections', { expanded }) 
	yield put({ type: COLLECTIONS_REFRESH_REQ })
}

function* reorderAll({ ignore=false, method }){
	if (ignore) return

	yield call(Api.put, 'collections', { sort: method }) 
}

function* changeView({ ignore=false, view }){
	if (ignore) return

	yield call(Api.put, 'collections', { view }) 
}

export function* removeAllCollections({ ignore=false, onSuccess, onFail }){
	if (ignore) return

	try{
		const { collections: { items } } = yield select()

		const root = _.filter(
			items,
			({ _id, parentId, access: { level } })=>
				_id == -1 || (_id > 0 && level >= 3 && !parentId)
		)

		for(const { _id } of root)
			yield removeCollection({ _id })

		if (onSuccess)
			onSuccess()
	} catch (error) {
		if (onFail)
			onFail(error)
	}
}

export function* clean({ ignore=false, onSuccess, onFail }){
	if (ignore) return

	try{
		const { count=0 } = yield call(Api.put, 'collections/clean')
		yield put({ type: COLLECTIONS_CLEAN_SUCCESS, count, onSuccess, onFail })
		yield put({ type: COLLECTIONS_REFRESH_REQ })
	} catch (error) {
		yield put({ type: COLLECTIONS_CLEAN_ERROR, error, onSuccess, onFail })
	}
}