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
