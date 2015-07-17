###*
 * @package   CleverStyle Music
 * @category  app
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2014-2015, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
###
if !window.indexedDB
	alert "Indexed DB is not supported O_o"
	return
db				= null
on_db_ready		= []
do ->
	request 		= indexedDB.open('music_db', 1)
	request.onsuccess = ->
		db = request.result
		while callback = on_db_ready.shift()
			callback()
		return
	request.onerror = (e) ->
		console.error(e)
		return
	request.onupgradeneeded = ->
		db = request.result
		if db.objectStoreNames.contains('music')
			db.deleteObjectStore('music')
		music_store = db.createObjectStore(
			'music'
			keyPath			: 'id'
			autoIncrement	: true
		)
		music_store.createIndex(
			'name'
			'name'
			unique	: true
		)
		meta_store = db.createObjectStore(
			'meta'
			keyPath	: 'id'
		)
		meta_store.createIndex('title', 'title')
		meta_store.createIndex('artist', 'artist')
		meta_store.createIndex('album', 'album')
		meta_store.createIndex('genre', 'genre')
		meta_store.createIndex('year', 'year')
		db.transaction.oncomplete	= ->
			while callback = on_db_ready.shift()
				callback()
		return
onready	= (callback) ->
	callback	= callback.bind(@)
	if db
		callback()
	else
		on_db_ready.push(callback)
	return
wrap	= (request_callback) ->
	(success_callback, error_callback) ->
		onready	->
			request	= request_callback()
			if success_callback
				request.onsuccess	= -> success_callback(@result)
			if error_callback
				request.onerror	= error_callback
cs.db	=
	read		: (store_name, value, field) ->
		wrap ->
			store_object = db.transaction([store_name]).objectStore(store_name)
			if field
				store_object	= store_object.index(field)
			store_object.get(value)
	read_all	: (store_name, callback, filter) ->
		onready	->
			all	= []
			db.transaction([store_name]).objectStore(store_name).openCursor().onsuccess	= ->
				result	= @result
				if result
					if !filter || filter(result.value)
						all.push(result.value)
					result.continue()
				else
					callback(all)
	count		: (store_name, callback, filter) ->
		onready	->
			count	= 0
			db.transaction([store_name]).objectStore(store_name).openCursor().onsuccess	= ->
				result	= @result
				if result
					if !filter || filter(result.value)
						++count
					result.continue()
				else
					callback(count)
	insert		: (store_name, data) ->
		wrap ->
			db.transaction([store_name], 'readwrite').objectStore(store_name).put(data)
	'delete'	: (store_name, id) ->
		wrap ->
			db.transaction([store_name], 'readwrite').objectStore(store_name).delete(id)
