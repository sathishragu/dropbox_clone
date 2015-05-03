
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
// bluebird.longStackTraces()
require('longjohn')

const TCP_PORT = '8001'

function connectToServer1(){
	console.log('connecting to tcp server 1 now')
	let client_socket = jot.connect(TCP_PORT, function(){
    // Send the initial message once connected
    client_socket.write({question: "Hello, SATHISH"});
  });
	client_socket.on('data',function(data){
		console.log(data)
	})
	console.log('connected to tcp server 1 now')
}

function connectToServer2(){
	console.log('connecting to tcp server 2 now')
	let client_socket = jot.connect(TCP_PORT, function(){
    // Send the initial message once connected
    client_socket.write({question: "Hello, RAGU"});
  });
	client_socket.on('data',function(data){
		console.log(data)
	})
	console.log('connected to tcp server 2 now')
}

connectToServer1()
connectToServer2()