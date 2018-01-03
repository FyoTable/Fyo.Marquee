


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
			var AndroidFullScreen = AndroidFullScreen || null;
			if(AndroidFullScreen) {
				AndroidFullScreen.immersiveMode(function() {}, function() {});
			}
		 	ReadFyoConfig(function(err, result) {

				document.getElementById('qr').setAttribute('src', 'http://127.0.0.1:8080/qr/' + encodeURIComponent(result.portalEndPoint));
				document.getElementById('qr2').setAttribute('src', 'http://127.0.0.1:8080/qr/' + encodeURIComponent(result.portalEndPoint));

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

				function CodeGen(id, player) {
					fetch('http://fyo.io/api/code/create/' + result.id + '/' + player, {
						method: 'POST'
					}).then( function( result) {
						console.log(result);
						result.json().then(function(code) { 							
							document.getElementById(id).innerText = code;						
						} )
					});
					setTimeout(function() {
						CodeGen(id, player);
					}, 5 * 1000 * 60); // Every 5 minutes
				}

				// Portal Code Gens
				for(var i = 0; i < 6; i++) {
					CodeGen('code-' + (i + 1), i);
				}



				function SetGame(g) {
					ReadFileDataURL(cordova.file.externalDataDirectory + g.img, function(err, data) {
						console.log(err, data);
						g.imgURL = data;
					});
				}
				result.games = [{
					app: 'com.HyperHiatus.HyperTanks',
					img: 'cover1.svg',
					imgURL: '/HyperTanks/cover1.svg'
				},{
					app: 'io.DCCKLLC.TicTacToe',
					img: 'cover2.svg',
					imgURL: '/TicTacToe/cover2.svg'
				},{
					app: 'io.DCCKLLC.ZombieGame',
					imgURL: '/ZombieGame/cover3.svg'
				}];
				// for(var i = 0; i < result.games.length; i++) {
				// 	SetGame(result.games[i]);
				// }

				var imageContainers = document.getElementsByClassName('images');
				for(var i = 0; i < imageContainers.length; i++) {
					var c = imageContainers[i];
					for(var j = 0; j < result.games.length; j++) {
						var g = result.games[j];
						var imgEl = document.createElement('img');
						//imgEl.setAttribute('src', cordova.file.externalDataDirectory + g.img);
						imgEl.setAttribute('src', 'http://127.0.0.1:8080' + g.imgURL);
						c.appendChild(imgEl);
					}
				}

				var socket = io('http://127.0.0.1:8080');
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
