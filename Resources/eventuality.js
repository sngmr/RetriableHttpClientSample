var Eventuality = function() {
	this._events;
}
Eventuality.prototype.addEventListener = function(name, callback) {
	var self = this;
	self._events = self._events || {};
    if (typeof self._events[name] === 'undefined') {
		self._events[name] = [callback];
    } else {
		self._events[name].push(callback);
    }
}
Eventuality.prototype.removeEventListener = function (name, callback) {
	var self = this;
    if (self._events && typeof self._events[name] !== 'undefined') {
		self._events = self._events.filter(function (filterCallback) {
			return callback === filterCallback;
	    });
	}
};
Eventuality.prototype.fireEvent = function (name, param) {
	var self = this;
    if (self._events && typeof self._events[name] !== 'undefined') {
		self._events[name].forEach(function(callback) {
			try {
				callback(param);
			} catch(e) {
				Ti.API.error(e);
			}
	    });
    }
};
exports.Eventuality = Eventuality;