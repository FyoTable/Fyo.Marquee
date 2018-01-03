
document.addEventListener('deviceready', function() {
	document.getElementById('dir').innerText = cordova.file.externalDataDirectory || 'not set';
	ReadFyoConfig(function(err, result) {
		document.getElementById('fyoserver').innerText = result.fyoserver || 'not set';
	});
}, false);
