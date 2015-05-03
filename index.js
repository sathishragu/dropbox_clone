let fs = require('fs')
let path = require('path')
let express = require('express')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let jot = require('json-over-tcp')
let mime = require('mime-types')
require('songbird')
// let bluebird = require('bluebird')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let argv = require('yargs')
.argv
// bluebird.longStackTraces()
require('longjohn')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = argv.dirname ? path.resolve(argv.dirname) : path.resolve(process.cwd())
const TCP_PORT = '8001'

let app = express()

if (NODE_ENV === 'development') {
	app.use(morgan('dev'))
}
app.listen(PORT, ()=> console.log(`LISTENING @ http://127.0.0.1:${PORT}`))
console.log('Root dir is :'+ROOT_DIR)
app.get('*', setFileMeta, setDirDetails, sendHeaders, (req, res) => {
		if(res.body) {
			res.json(res.body)
			return
		}
		fs.createReadStream(req.filePath).pipe(res)
})

app.head('*', setFileMeta, sendHeaders, (req, res) => res.end())
app.delete('*', setFileMeta, setDirDetails, (req, res, next) => {
	async() => {
		let type = req.isDir ? 'Directory' : 'File'
		if(!req.stat) return res.send(400, 'Invalid Path')
		if(req.stat.isDirectory()) {
			await rimraf.promise(req.filePath)
		} else {
			await fs.promise.unlink(req.filePath)
		}
		res.end()
		for(let server_socket of server_sockets_list){
			server_socket.write({action : 'DELETE',path : req.filePath, type : type ,contents : '',updated : Date.now()})
	    }
	}().catch(next)
})

app.put('*', setFileMeta, setDirDetails, (req, res, next) => {
	async ()=> {
		let fileContent = ''
		let type = req.isDir ? 'Directory' : 'File'
		if(req.stat) return res.send(405, 'File exists')
		await mkdirp.promise(req.dirPath)
		if(!req.isDir)
			await req.pipe(fs.createWriteStream(req.filePath))
		res.end()
		if(!req.isDir){
			await fs.promise.readFile(req.filePath, 'utf8')
			.then(data => {
				console.log(data)
	  		fileContent = JSON.stringify(data)
			})
	  		
		}
		for(let server_socket of server_sockets_list){
			server_socket.write({action : 'PUT',path : req.filePath, type : type, contents : fileContent,updated : Date.now()})
	    }
	}().catch(next)
})

app.post('*', setFileMeta, setDirDetails, (req, res, next) => {
	async ()=> {
		let type = req.isDir ? 'Directory' : 'File'
		if(!req.stat) return res.send(405, 'File does not exist')
		if(req.isDir) return res.send(405, 'Path is a directory')
		await fs.promise.truncate(req.filePath, 0)
		await req.pipe(fs.createWriteStream(req.filePath))
		res.end()
		await fs.promise.readFile(req.filePath, 'utf8')
  		.then(data => {
  			for(let server_socket of server_sockets_list){
			server_socket.write({action : 'POST',path : req.filePath, type : type ,contents : JSON.stringify(data),updated : Date.now()})
	    	}
	    })
	}().catch(next)
})


function setDirDetails(req, res, next) {
	let endWithSlash = req.filePath.charAt(req.filePath.length-1) === path.sep
	console.log('endWithSlash' + endWithSlash)
	console.log('req.filePath.charAt(req.filePath-1)' + req.filePath.charAt(req.filePath-1))
	console.log('path.sep' + path.sep)
	let hasExt = path.extname(req.filePath) !== ''
	console.log('hasExt' + hasExt)
	req.isDir = endWithSlash || !hasExt
	console.log('req.isDir' + req.isDir)
	req.dirPath = req.isDir ? req.filePath : path.dirname(req.filePath)
	next()
}

function setFileMeta (req, res, next) {
	req.filePath = path.resolve(path.join(ROOT_DIR, req.url))
	if(req.filePath.indexOf(ROOT_DIR) !== 0) {
		res.send(400, 'Invalid path')
		return
	}
	fs.promise.stat(req.filePath)
		.then(stat => req.stat = stat, () => req.stat = null)
		.nodeify(next)
}

function sendHeaders(req, res, next) {
	nodeify(async ()=> {
		if(req.stat){
			if(req.stat.isDirectory()){
				let files = await fs.promise.readdir(req.filePath)
				res.body = JSON.stringify(files)
				res.setHeader('Content-Length', res.body.length)
				res.setHeader('Content-Tyoe', 'application/json')
				return
			}
			res.setHeader('Content-Length', req.stat.size)
			let contentType = mime.contentType(path.extname(req.filePath))
			res.setHeader('Content-Tyoe', contentType)
		}
	}(), next)
}

//Creating a tcp server port and make it listen
let tcp_server = jot.createServer(TCP_PORT)
let server_sockets_list = []
tcp_server.listen(TCP_PORT)
tcp_server.on('connection', function(server_socket){
	console.log('Connection received at server')
	server_sockets_list.push(server_socket)
})


