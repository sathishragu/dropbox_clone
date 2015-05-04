# dropbox_clone

Time spent: 12 hrs

Features

Required

[DONE] Client can make GET requests to get file or directory contents

[DONE] Client can make HEAD request to get just the GET headers

[DONE] Client can make PUT requests to create new directories and files with content

[DONE] Client can make POST requests to update the contents of a file

[DONE] Client can make DELETE requests to delete files and folders

[DONE] Server will serve from --dir or cwd as root

[DONE] Client will sync from server over TCP to cwd or CLI dir argument


Optional

[ ] Client and User will be redirected from HTTP to HTTPS

[ ] Server will sync from client over TCP

[ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits

[ ] Client can stream and scrub video files (e.g., on iOS)

[ ] Client can download a directory as an archive

[ ] Client can create a directory with an archive

[ ] User can connect to the server using an FTP client


Walkthrough

To start server and client :

nodemon --exec babel-node -- --stage 1 --optional strict -- index.js --dirname "/tmp/server"

nodemon --exec babel-node -- --stage 1 --optional strict -- client.js --dirname "/tmp/client1”

Command for operations :

curl -v http://127.0.0.1:8000/bar1/foo1.txt -X PUT -d "hello Sathish"

curl -v http://127.0.0.1:8000/bar2 -X PUT

curl -v http://127.0.0.1:8000/bar1/foo1.txt -X HEAD

curl -v http://127.0.0.1:8000/bar1 -X HEAD

curl -v http://127.0.0.1:8000/bar1/foo1.txt -X POST -d "Hello Sathish updated"

curl -v http://127.0.0.1:8000/bar1/foo1.txt -X DELETE

curl -v http://127.0.0.1:8000/bar2 -X DELETE

![alt tag](https://github.com/sathishragu/dropbox_clone/blob/master/dropbox_clone_screen.gif)
