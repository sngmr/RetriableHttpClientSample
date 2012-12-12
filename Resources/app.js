var win = Ti.UI.createWindow({
	layout: 'vertical'
});

// 通信開始ボタン
var button = Ti.UI.createButton({
	title: '通信開始'
});
win.add(button);

// 通信結果の表示エリア
var result = Ti.UI.createTextArea({
	width: Ti.UI.FILL,
	height: 400
});
win.add(result);

button.addEventListener('click', function() {
	var HttpClient = require('http_client').HttpClient;
	var http = new HttpClient();
	http.addEventListener('load', function(e) {
		result.value = e.data;
	});
	http.addEventListener('error', function(error) {
		result.value = error.status + ':' + error.message;
	});
	http.open('GET', 'http://pachinkosns.herokuapp.com/api/v1/tweets');
	http.send();
});

win.open();
