#!/usr/bin/python
# usage: python slow-server.py [port-number]
# from https://www.acmesystems.it/python_http
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep

import time
import sys

portNumber = sys.argv[1] if len(sys.argv) > 1 else 4242

#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
    
    #Handler for the GET requests
    def do_GET(self):
        if self.path=='/':
            self.path='/index.html'
        elif self.path.endswith('/'):
            self.path=self.path+'index.html'
        print self.path
        print 'lagging...'
        time.sleep(0.5)
        print '3'
        time.sleep(0.5)
        print '2'
        time.sleep(0.5)
        print '1'
        time.sleep(0.5)

        try:
            #Check the file extension required and
            #set the right mime type

            sendReply = False
            if self.path.endswith('.html'):
                mimetype='text/html'
                sendReply = True
            if self.path.endswith('.jpg'):
                mimetype='image/jpg'
                sendReply = True
            if self.path.endswith('.png'):
                mimetype='image/png'
                sendReply = True
            if self.path.endswith('.gif'):
                mimetype='image/gif'
                sendReply = True
            if self.path.endswith('.js'):
                print 'Lagging more for JS file...'
                time.sleep(3)
                mimetype='application/javascript'
                sendReply = True
            if self.path.endswith('.css'):
                mimetype='text/css'
                sendReply = True

            if sendReply == True:
                print 'sending!'
                #Open the static file requested and send it
                f = open(curdir + sep + self.path) 
                self.send_response(200)
                self.send_header('Content-type',mimetype)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            return


        except IOError:
            self.send_error(404,'File Not Found: %s' % self.path)

try:
    #Create a web server and define the handler to manage the
    #incoming request
    server = HTTPServer(('', portNumber), myHandler)
    print 'Started httpserver on port ' , portNumber
    
    #Wait forever for incoming htto requests
    server.serve_forever()

except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()