
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

const TCP_PORT = '8001'
const ROOT_DIR = argv.dirname ? path.resolve(argv.dirname) : '/tmp'
const CLIENT_ID = process.env.CLIENT_ID || 9001

function connectToServer1(){
	let client_socket = jot.connect(TCP_PORT, function(){
    // Send the initial message once connected
    client_socket.write({clientId: CLIENT_ID});
  });
	client_socket.on('data', (data) => {
	console.log(data)	
   updateClient(data)
  })
	console.log('connected to tcp server now')
}

connectToServer1()

//Below functions to update folders/files in client


function updateClient(data){

    if(data.action === 'PUT'){
      putOperation(data)
    } else if (data.action === 'POST') {
      postOperation(data)
    } else if (data.action === 'DELETE') {
      deleteOperation(data)
    }else {
      console.log('Unknown operation to client. Exit!')
      return
    }
}

//Handler function to create contents on client dd
async function putOperation(data){
  let filePath = ROOT_DIR + data.path
  let processData = {}
  await doesFileExist(filePath, processData)

  if (processData.filexists === true){
    console.log('File exists. Exiting now.')
    return
  } else {
    console.log('File doesnt exist. Continuing to create the file')
  }

  // Write the contents to a file
  if (data.type === 'Directory') {
    await mkdirp.promise(filePath)
    console.log('Directory created successfully at '+filePath)
  } else {
  	await mkdirp.promise(path.dirname(filePath))
     await fs.promise.writeFile(filePath, data.contents, 'utf-8')
    console.log('File created successfully :'+filePath)
  }
}

//Handler function to update contents on client
async function postOperation(data){
  let filePath = ROOT_DIR + data.path
  if (data.type === 'Directory') {
     console.log('File is a directory. Exiting now.')
     return
  }
  // Write the contents to a file
  await fs.promise.truncate(filePath, 0)
  await fs.promise.writeFile(filePath, data.contents, 'utf-8')
  console.log('File updated successfully :'+filePath)
}

//Handler function to delete contents on client
async function deleteOperation(data){
  let filePath = ROOT_DIR + data.path
  let processData = {}
  await doesFileExist(filePath, processData)
  if(processData.filexists !== true){
    console.log('File doesnt exist in client. Exit')
    return
  }

  if(data.type === 'Directory'){
      await rimraf.promise(filePath)
      console.log('Directory deleted successfully :'+filePath)
  } else {
    await fs.promise.unlink(filePath)
    console.log('File deleted successfully :'+filePath)
  }
}

async function doesFileExist(filePath, processData){
  await fs.promise.stat(filePath)
  .then(
   () => {
     processData.filexists = true
   },
   () => {
     processData.filexists = false
   })
}