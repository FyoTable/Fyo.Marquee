
function ReadFyoConfig(cb) {

	if(!cordova.file.externalDataDirectory) {
		cordova.file.externalDataDirectory = '';
	}

	ReadFile(cordova.file.externalDataDirectory + "fyo.json", function(err, text) {
		var result;

		if(err) {
			result = {};
			result.games = [];
			result.ads = [];
			result.fyoserver = '10.1.107.163:8080';

			ReadFile(cordova.file.externalRootDirectory + "fyo.json", function(err, text) {
				if(!err) {
					result = JSON.parse(text);
				}
				cb && cb(err, result);
			});

		} else {
			result = JSON.parse(text);
			cb && cb(null, result);
		}

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
		 	AndroidFullScreen.immersiveMode(function() {}, function() {});
		 	ReadFyoConfig(function(err, result) {

				document.getElementById('qr').setAttribute('src', 'http://' + result.fyoserver + '/qr/' + encodeURIComponent(result.fyoserver));
				document.getElementById('qr2').setAttribute('src', 'http://' + result.fyoserver + '/qr/' + encodeURIComponent(result.fyoserver));

				var ind = 0;
				var timer = null;
				document.getElementById('qr').onclick = function() {
					if(timer != null) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() {
						ind = 0;
					}, 5000);

					ind++;
					if(ind >= 5) {
						window.location = 'admin.html';
					}


				};
				// document.getElementById('version').innerText = result.version;
				// document.getElementById('fyoserver').innerText = result.fyoserver;

				function SetGame(g) {
					ReadFileDataURL(cordova.file.externalDataDirectory + g.img, function(err, data) {
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
						imgEl.setAttribute('src', cordova.file.externalDataDirectory + g.img);
						c.appendChild(imgEl);
					}
				}

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
						if(data.Controller != 'Marquee') {
							return socket.emit("SGRedirectMsg", 'Marquee');
						} else {
							socket.emit("SGUpdateMsg", {
								MessageType: "Games",
								data: result.games
							});
						}
					});

					socket.on('AppFocusMsg', function() {
						return socket.emit("SGRedirectMsg", 'Marquee');
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
		// }, false);
	},

	// Update DOM on a Received Event
	receivedEvent: function(id) {

	}
};


app.initialize();
