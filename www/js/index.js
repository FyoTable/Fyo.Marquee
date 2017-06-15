function ReadFile(p, cb) {
	window.resolveLocalFileSystemURL(p,
		function(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onloadend = function(e) {
					cb && cb(null, this.result);
				}

				reader.readAsText(file);
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

function ReadFyoConfig() {
	ReadFile(cordova.file.externalRootDirectory + "fyo.json", function(err, text) {
		var result = JSON.parse(text);
		// document.getElementById('version').innerText = result.version;
		// document.getElementById('fyoserver').innerText = result.fyoserver;

		function SetGame(g) {
			ReadFileDataURL(cordova.file.externalRootDirectory + g.img, function(err, data) {
				console.log(err, data);
				g.imgURL = data;
			});
		}
		for(var i = 0; i < result.games.length; i++) {
			SetGame(result.games[i]);
		}

		var imageContainers = document.getElementsByClassName('images');
		for(var i = 0; i < imageContainers.length; i++) {
			var c = imageContainers[i];
			for(var j = 0; j < result.games.length; j++) {
				var g = result.games[j];
				var imgEl = document.createElement('img');
				imgEl.setAttribute('src', 'file:///storage/emulated/0/' + g.img);
				c.appendChild(imgEl);
			}
		}

		// var gamesEl = document.getElementById('games');
		// for(var i = 0; i < result.games.length; i++) {
		// 	var gEl = document.createElement('div');
		// 	gEl.setAttribute('class', 'game');
		// 	gEl.innerText = result.games[i];
		// 	gEl.addEventListener('click', function() {
		// 		var app = this.innerText;
		// 		OpenApp(app.toLowerCase());
		// 	});
		// 	gamesEl.append(gEl);
		// }
		//
		// var adsEl = document.getElementById('ads');
		// for(var i = 0; i < result.ads.length; i++) {
		// 	var aEl = document.createElement('div');
		// 	aEl.innerText = result.ads[i].type + ' : ' + result.ads[i].src;
		// 	adsEl.append(aEl);
		// }

		console.log('connecting to', result.fyoserver);

		var socket = io('http://' + result.fyoserver);
		socket.on('connect', function () {
			console.log('connected');
			socket.emit('AppHandshakeMsg', {
				AppIDString: 'Marquee',
				Controller: 'Marquee'
			});
			socket.on('AppHandshakeMsg', function() {
				socket.emit("SGRedirectMsg", 'Marquee');
			});

			socket.on('SGConnected', function(data) {
				console.log(data);
				if(data.controller != 'Marquee') {
					return socket.emit("SGRedirectMsg", 'Marquee');
				} else {
					socket.emit("SGUpdateMsg", {
						MessageType: "Games",
						data: result.games
					});
				}
			});

			socket.on('SGReconnectMsg', function(data) {
				socket.emit("SGUpdateMsg", {
					MessageType: "Games",
					data: result.games
				});
			});

		});

		socket.on('SGUpdateMsg', function (packet) {
			console.log(packet);
			switch (packet.MessageType) {
				case 'Input': {
					var input = {
						x2: packet.data["axis 0"],
						y2: -packet.data["axis 1"],
						x: packet.data["axis 2"],
						y: -packet.data["axis 3"],
						a: packet.data['button 0'],
						b: packet.data['button 1'],
						start: packet.data['button 2'],
					};

					if(input.a) {
						OpenApp('io.cordova.testapp');
					}

					window.lastController = input;
					break;
				}
				case 'Start': {
					console.log('START');
					OpenApp('io.cordova.testapp');
					OpenApp(packet.data);
					break;
				}
			}
		});
	});
}

var app = {
	// Application Constructor
	initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},

	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function() {
		this.receivedEvent('deviceready');

		// document.getElementById('video').onclick = function() {
		// 	document.getElementById('video').play();
		// }
		//
		// document.addEventListener("deviceready", function() {
		// 	AndroidFullScreen.immersiveMode(function() {}, function() {});
		 	ReadFyoConfig();
		// }, false);
	},

	// Update DOM on a Received Event
	receivedEvent: function(id) {

	}
};


app.initialize();
