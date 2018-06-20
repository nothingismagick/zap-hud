/*
 * Show / Enable Tool
 *
 * Description goes here...
 */

var History = (function() {

	// Constants
	// todo: could probably switch this to a config file?
	var NAME = "history";
	var LABEL = "History";
	var DATA = {};
	var ICONS = {};
        ICONS.CLOCK = "clock.png";
    var tool = {};

	//todo: change this to a util function that reads in a config file (json/xml)
	function initializeStorage() {
		tool.name = NAME;
        tool.label = LABEL;
		tool.data = 0;
		tool.icon = ICONS.CLOCK;
        tool.isSelected = false;
        tool.isHidden = true;
		tool.panel = "";
        tool.position = 0;
        tool.messages = [];

        saveTool(tool);
        registerForZapEvents("org.parosproxy.paros.extension.history.ProxyListenerLogEventPublisher");
	}

	function showOptions() {
		var config = {};

		config.tool = NAME;
		config.toolLabel = LABEL;
		config.options = {remove: "Remove"};

		messageFrame("display", {action:"showButtonOptions", config:config})
			.then(function(response) {
				// Handle button choice
				if (response.id == "remove") {
					removeToolFromPanel(NAME);
				}
				else {
					//cancel
				}
			})
			.catch(errorHandler);
    }
    
    self.addEventListener("org.parosproxy.paros.extension.history.ProxyListenerLogEventPublisher", function(event) {
		var eventType = event.detail['event.type'];
        log (LOG_DEBUG, 'HistoryEventPublisher eventListener', 'Received ' + eventType + ' event');

        let message = {};
        
        // unary `+` to convert string to int
        let date = new Date(+event.detail.timeSentInMs);

        message.time = date.toTimeString();
        message.method = event.detail.method;
        message.url = event.detail.uri;
        message.code = event.detail.statusCode;

        // TODO: may want to encapsulate into a single "update" function?
        messageFrame('drawer', {action: 'updateMessages', messages: [message]})
            .catch(errorHandler);

        tool.messages.push(message);
        saveTool(tool);
	});

	self.addEventListener("activate", function(event) {
		initializeStorage();
	});

	self.addEventListener("targetload", function(event) {
        
	});

	self.addEventListener("message", function(event) {
		var message = event.data;

		// Broadcasts
		switch(message.action) {
			case "initializeTools":
				initializeStorage();
                break;
                
            case "frameload":
                if (message.name === "drawer") {
                    //TODO: ?
                }
                break;

			default:
				break;
		}

		// Directed
		if (message.tool === NAME) {
			switch(message.action) {
				case "buttonMenuClicked":
					showOptions();
					break;

				default:
					break;
			}
		}
	});

	return {
		name: NAME,
		initialize: initializeStorage
	};
})();

self.tools[History.name] = History;