var eventuality = require('eventuality');

/**
 * Titanium.Network.HTTPClient のWrapper
 */
var HttpClient = function(args) {
	var self = this;
	args = args || {};
	
	// HTTPClientのタイムアウト（ミリ秒）
	this.httpTimeout = args.httpTimeout || 5000;
	// リトライ回数
	this.retryCount = args.retryCount || 2;
	// リトライまでの待ち時間（ミリ秒）
	this.retryWaitTime = args.retryWaitTime || 1000;
	// 現在のリトライ回数
	this.currentRetryCount = 0;
	
	// リトライ用に保存しておくHttpClient用パラメータ
	this.saveMethod = '';
	this.saveUrl = '';
	this.saveData = null;
	
	// HTTPClientを生成する
	this.http = Ti.Network.createHTTPClient({
		onload: function(e) {
			self.onloadHandler(e);
		},
		onerror: function(error) {
			self.onerrorHandler(error);
		},
		timeout: this.httpTimeout
	});
}

// イベントメカニズムを継承する
HttpClient.prototype = new eventuality.Eventuality();

/**
 * HTTPClient.open のWrapper
 * @param {Object} method
 * @param {Object} url
 */
HttpClient.prototype.open = function(method, url) {
	// リトライに備えてデータを保存
	this.saveMethod = method;
	this.saveUrl = url;
	
	// HTTPClient.openを実行
	this.http.open(method, url);
}

/**
 * HTTPClient.send のWrapper
 * @param {Object} data
 */
HttpClient.prototype.send = function(data) {
	// リトライに備えてデータを保存
	this.saveData = data;
	
	// HTTPClient.sendを実行
	this.http.send(data);
}

/**
 * HttpClientロード時ハンドラ
 * @param {Object} e
 */
HttpClient.prototype.onloadHandler = function(e) {
	// ロードイベントを発行
	if (e.source.responseText) {
		this.fireEvent('load', {data:e.source.responseText});
	} else {
		this.fireEvent('load', {data:null});
	}
	this.http = null;
}

/**
 * HttpClientエラー時ハンドラ（リトライ機能付き）
 * @param {Object} error
 */
HttpClient.prototype.onerrorHandler = function(error) {
	var status = error.source.status;
	Ti.API.error('[HTTPClient] Error! HTTP Status = ' + status);
	Ti.API.error(error);
	
	// タイムアウトとHTTPステータスが500以上はリトライ試行回数までリトライ
	// ※HttpClientのタイムアウトはhttpStatusで検知できないので0ならそう扱う
	if ((status == 0 || status >= 500) && this.currentRetryCount < this.retryCount) {
		var self = this;
		setTimeout(function() {
			error.source.open(self.saveMethod, self.saveUrl);
			error.source.send(self.saveData);
		}, this.retryWaitTime);
		
		this.currentRetryCount += 1;
		Ti.API.warn('[HTTPClient] Retry. Retry count = ' + this.currentRetryCount);
	} else {
		// エラーイベントを発行
		this.fireEvent('error', {status:status,message:error.source.statusText});
		this.http = null;
	}
}

/**
 * EXPORTS
 */
exports.HttpClient = HttpClient;
