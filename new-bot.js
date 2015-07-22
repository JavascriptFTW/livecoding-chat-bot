/* This project is a spinoff of the LCTV chat bot created by Christy94 which can be found here https://github.com/Cristy94/livecoding-chat-bot */
var Bot = (function() {
	var container = $('.message-pane');
	var textarea = $('#message-textarea');
	var submit = $('input[type="submit"]');

	$('.message', container).addClass('read');

//Great... FF froze...

	var commands = {};

	var internal = {
		messageQueue: [],
		names: ["Bob", "Joe", "Mr. Bond"]
	};

	var commandUtil = {};

	var Bot = {
		name: "Bob the bot",
		welcome: "Welcome to the stream {{USER}}!"
	};
	// Initialize the color pallete
	$('#username-color').trigger('click');
	$('#context-menu').trigger('mouseout');
	var initialColor = $('#colorPremiumInput').val();
	console.log(initialColor);


	internal.processMessage = function(msg) {
		if (msg.hasClass("message-info")) {
			var text = message.text();
        
	        // Someone entered the room
	        if (text.indexOf(' joined the room.') !== -1) {
	            var username = text.slice(0, text.indexOf(' joined the room.'));
	            postMessage(Bot.welcome.replace("{{USER}}", username));
	        }
		} else {
			var parsedMsg = {
				sender: msg[0].childNodes[0].textContent,
				body: msg[0].childNodes[1].textContent
			};

			if (parsedMsg.body[0] === "/") {
				internal.runCommand(parsedMsg.body.substr(1), parsedMsg.sender);
			} else {
				//Possibly notify the user in some unobtrusive way that there's a new message
			}
		}
	}

	internal.runCommand = function(cmd, sender) {
		var data = cmd.split(" ");
		data.push(sender || internal.names[Math.floor(Math.random(internal.names.length))]);
		var command = data.shift();

		if (commands[command] !== undefined) {
			commands[command].apply(commandUtil, data);
		}
	}

	internal.sendMessage = function(msg, sender) {
		textarea.val((sender || Bot.name) + ": " + msg);
		submit.trigger("click");
		setTimeout(function() {
			if (internal.messageQueue.length === 0) {
	    		$('.user-color-item').eq(0).attr('data-color', initialColor).trigger('click');
	    	}
		}, 300);
	}

	internal.getMessages = function() {
		var newMessages = $('.message:not(.read)', container);
		newMessages.each(function() {
			var $this = $(this);
			$this.addClass("read");
			internal.messageQueue.push($this);
		});
	}

	internal.update = function() {
		internal.getMessages();
		if (internal.messageQueue.length > 0) {
			while (internal.messageQueue.length > 0 && textarea.val() === "") {
				$('.user-color-item').eq(0).attr('data-color', '#FFFFFF').trigger('click');
				setTimeout(function() {
					var message = internal.messageQueue.shift();
					internal.processMessage(message);
				}, 500)
			}
		}
		setTimeout(internal.update, 1);
	}



	commandUtil.sendMessage = function(msg, sender) {
		internal.sendMessage(msg, sender || Bot.name);
	}



	Bot.setCommand = function(cmd, callback) {
		var funcRegex = /\((.+)\)(?: |){([^]+)}/;
		/* funcStuff[1] is the functions parameters, funcStuff[2] is the body */
		var funcStuff = callback.toString().match(funcRegex);

		var data = funcStuff[1].split(/(?:, |,)/g);
		data.push("with(this){" + funcStuff[2] + "}");

		var command = Function.apply({}, data);

		commands[cmd] = command;
	}

	Bot.runCommand = function(cmd, args) {
		if (commands[cmd] !== undefined) {
			commands[cmd].apply(commandUtil, args);
		}
	}

	Bot.testCommand = function(cmdString) {
		internal.runCommand(cmdString);
	}

	Bot.sendMessage = internal.sendMessage;



	setTimeout(internal.update, 1);



	return Bot;
})();

Bot.setCommand("add", function(a, b) {
	sendMessage(a + " plus " + b + " equals " + (parseInt(a) + parseInt(b)))
})