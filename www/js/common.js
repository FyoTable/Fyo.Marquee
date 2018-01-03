var Global = Global || {};
(function () {
   'use strict';

    function Requestor(url, method, data) {
        this.doneCB = null;
        this.failCB = null;

        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.responseType = 'json';
        var self = this;
        xhr.onreadystatechange = function () {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    if(self.doneCB) {
                        self.doneCB(xhr.response);
                    }
                } else {
                    if(self.failCB) {
                        console.log('Error: ' + xhr.status); // An error occurred during the request.
                        self.failCB(xhr.status);
                    }
                }
            }
        };
    }

    Requestor.prototype = {
        done: function(cb) {
            this.doneCB = cb;
        },
        fail: function(cb) {
            this.failCB = cb;
        }
    };

    Global.HTTP = {
        GET: function(url) {
            return new Requestor(url, 'GET', null);
        },
        POST: function(url, data) {
            return new Requestor(url, 'POST', data);
        }
    };
}());


function ReadFile(p, cb) {
	window.resolveLocalFileSystemURL(p,
		function(fileEntry) {
			console.log(fileEntry);
			fileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onloadend = function(e) {
					console.log("Successful file read: " + this.result);
					cb && cb(null, this.result);
				}
				reader.onprogress = function(e) {
					console.log(e); }
				reader.onloadstart = function(e) {
					console.log(e); }
				reader.onload = function(e) {
					console.log(e); }
				reader.onerror = function(e) {
					console.log(e); }
				reader.onabort = function(e) {
					console.log(e); }

				reader.readAsText(file);//readAsDataURL(file);
			});
		}, function(err) {
			console.log(err);
			cb && cb(err);
		});
}

//
function ReadFileDataURL(p, cb) {
	window.resolveLocalFileSystemURL(p,
		function(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onloadend = function(e) {
					cb && cb(null, this.result);
				}

				reader.readAsDataURL(file);
			});
		}, function(err) {
			console.log(err);
			cb && cb(err);
		}
	);
}

function OpenApp(a) {
	startApp.set({ "package":a }, { }).start(function() {
		console.log("OK");
	}, function(error) {
		console.log(error);
	});
}

function ReadFyoConfig(cb) {
	cordova.file = cordova.file || {};

	var result = {
		games: [],
		ads: [],
		fyoserver: '',
		portalEndPoint: ''
	};

	var req = Global.HTTP.GET('http://127.0.0.1:8080/config');
	req.done( function(resp) {
		console.log(resp);
		result.id = resp.id;
		result.portalEndPoint = 'http://portal.fyo.io/connect/' + resp.id;
		result.fyoserver = resp.config.wireless.deviceIP;
		cb && cb(null, result);
	});
	req.fail( function() {
		cb && cb(true, null);
	});

		// if(!cordova.file.externalDataDirectory) {
		// 	cordova.file.externalDataDirectory = '';
		// }
	
		// ReadFile(cordova.file.externalDataDirectory + "fyo.json", function(err, text) {
		// 	var result;
	
		// 	if(err) {
		// 		result = {};
		// 		result.games = [];
		// 		result.ads = [];
		// 		result.fyoserver = '127.0.0.1:8080';
	
		// 		ReadFile(cordova.file.externalRootDirectory + "fyo.json", function(err, text) {
		// 			if(!err) {
		// 				result = JSON.parse(text);
		// 			}
		// 			cb && cb(err, result);
		// 		});
	
		// 	} else {
		// 		result = JSON.parse(text);
		// 		cb && cb(null, result);
		// 	}
	
		// });
	}