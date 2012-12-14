var Eventuality = function() {
	this.events;
}
Eventuality.prototype.addEventListener = function(name, callback) {
	this.events = this.events || {};
	if (typeof this.events[name] === 'undefined') {
		this.events[name] = [callback];
	} else {
		this.events[name].push(callback);
	}
}
Eventuality.prototype.removeEventListener = function (name, callback) {
	if (this.events && typeof this.events[name] !== 'undefined') {
		this.events = this.events.filter(function (filterCallback) {
			return callback === filterCallback;
		});
	}
};
Eventuality.prototype.fireEvent = function (name, param) {
	if (this.events && typeof this.events[name] !== 'undefined') {
		this.events[name].forEach(function(callback) {
			try {
				callback(param);
			} catch(e) {
				Ti.API.error(e);
			}
		});
	}
};
exports.Eventuality = Eventuality;
