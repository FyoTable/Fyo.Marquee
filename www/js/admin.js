
document.addEventListener('deviceready', function() {
	document.getElementById('dir').innerText = cordova.file.externalDataDirectory || 'not set';
}, false);
