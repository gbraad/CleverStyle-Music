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
music_storage	= navigator.getDeviceStorage('music')
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
library_size		= -1
cs.music_library	=
	add				: (name, callback) ->
		callback	= (callback || ->).bind(@)
		@onready ->
			put_transaction	= db
				.transaction(['music'], 'readwrite')
					.objectStore('music')
						.put(
							name	: name
						)
			put_transaction.onsuccess	= callback
			put_transaction.onerror		= callback
	parse_metadata	: (name, callback) ->
		callback	= (callback || ->).bind(@)
		db
			.transaction(['music'])
				.objectStore('music')
					.index('name')
						.get(name).onsuccess	= ->
							if @result
								data	= @result
								music_storage.get(data.name).onsuccess = ->
									if @result
										store	= (metadata) ->
											store_object = db
												.transaction(['meta'], 'readwrite')
													.objectStore('meta')
														.put(
															id		: data.id
															title	: metadata.title || ''
															artist	: metadata.artist || ''
															album	: metadata.album || ''
															genre	: metadata.genre || ''
															year	: metadata.year || metadata.recordingTime || ''
															rated	: metadata.rated || 0
														)
											store_object.onsuccess = ->
												callback()
											store_object.onerror = ->
												callback()
										parseAudioMetadata(
											@result
											(metadata) ->
												store(metadata)
											=>
												# If unable to get metadata with previous parser - try another one
												url		= URL.createObjectURL(@result)
												asset	= AV.Asset.fromURL(url)
												asset.get('metadata', (metadata) ->
													URL.revokeObjectURL(url)
													if !metadata
														callback()
														return
													store(metadata)
												)
												asset.on('error', ->
													# Get filename
													metadata	= data.name.split('/').pop()
													# remove extension
													metadata	= metadata.split('.')
													metadata.pop()
													metadata	= metadata.join('.')
													# Try to split filename on artist and title
													metadata	= metadata.split('–', 2)
													if metadata.length == 2
														store(
															artist	: $.trim(metadata[0])
															title	: $.trim(metadata[1])
														)
														return
													# Second trial
													metadata	= metadata[0].split(' - ', 2)
													if metadata.length == 2
														store(
															artist	: $.trim(metadata[0])
															title	: $.trim(metadata[1])
														)
														return
													# Assume that filename is title
													store(
														title	: $.trim(metadata[0])
													)
												)
										)
	get				: (id, callback) ->
		callback	= (callback || ->).bind(@)
		@onready ->
			db
				.transaction(['music'])
					.objectStore('music')
						.get(id).onsuccess	= ->
							result = @result
							if result
								callback(result)
	get_meta		: (id, callback) ->
		callback	= (callback || ->).bind(@)
		@onready ->
			db
				.transaction(['meta'])
					.objectStore('meta')
						.get(id).onsuccess	= ->
							result = @result
							if result
								callback(result)
							else
								callback(
									id	: id
								)
	get_all			: (callback, filter) ->
		callback	= (callback || ->).bind(@)
		filter		= filter || -> true
		@onready ->
			all					= []
			db
				.transaction(['music'])
					.objectStore('music')
						.openCursor().onsuccess	= ->
							result	= @result
							if result
								if filter(result.value)
									all.push(result.value)
								result.continue()
							else
								callback(all)
	del				: (id, callback) ->
		@onready ->
			db
				.transaction(['music'], 'readwrite')
					.objectStore('music')
						.delete(id)
						.onsuccess = ->
							db
								.transaction(['meta'], 'readwrite')
									.objectStore('meta')
										.delete(id)
										.onsuccess	= ->
											callback()
	size			: (callback, filter) ->
		callback	= (callback || ->).bind(@)
		filter		= filter || -> true
		@onready ->
			if library_size >= 0 && !filter
				callback(library_size)
			calculated_size	= 0
			db
				.transaction(['music'])
					.objectStore('music')
						.openCursor().onsuccess	= ->
							result	= @result
							if result
								if !filter || filter(result.value)
									++calculated_size
								result.continue()
							else
								if !filter
									library_size = calculated_size
								callback(calculated_size)
	rescan			: (done_callback) ->
		done_callback		= (done_callback || ->).bind(@)
		found_files			= 0
		@onready ->
			new_files		= []
			cs.storage.scan(
				(name) =>
					db.transaction(['music']).objectStore('music').index('name').get(name).onsuccess	= (e) =>
						if !e.target.result
							@add(name, ->
								@parse_metadata(name, ->
									new_files.push(name)
									++found_files
									cs.bus.fire('library/rescan/found', found_files)
								)
							)
						else
							new_files.push(name)
							++found_files
							cs.bus.fire('library/rescan/found', found_files)
				=>
					if !new_files.length
						alert _('no_files_found')
						return
					@get_all (all) =>
						id_to_remove	= []
						all.forEach (file) =>
							if file.name not in new_files
								id_to_remove.push(file.id)
							return
						remove	= (index) =>
							if id_to_remove[index]
								@del(id_to_remove[index], ->
									remove(index + 1)
								)
							else
								done_callback()
						remove(0)
			)
			return
	onready			: (callback) ->
		callback	= (callback || ->).bind(@)
		if db
			callback()
		else
			on_db_ready.push(callback)
		return
