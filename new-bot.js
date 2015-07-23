/* This project is a spinoff of the LCTV chat bot created by Christy94 which can be found here https://github.com/Cristy94/livecoding-chat-bot */
/*
Issues
Bot messes up with colors
Or not...
*/
var Bot = (function() {
	var container = $('.message-pane');
	var textarea = $('#message-textarea');
	var submit = $('input[type="submit"]');
	var myUser = $('.chat-heading div').text().replace('Chat: ', '');

	$('.message', container).addClass('read');



	var commands = {};

	var internal = {
		messageQueue: [],
		names: ["Bob", "Joe", "Mr. Bond"],
		waitingMessage: 0
	};

	var commandUtil = {};

	var Bot = {
		name: "Bob the bot",
		welcome: "Welcome to the stream {{USER}}!",
		enableWelcome: true
	};
	// Initialize the color pallete
	$('#username-color').trigger('click');
	$('#context-menu').trigger('mouseout');

	var initialColor = $('#colorPremiumInput').val();


	internal.processMessage = function(msg) {
		if (msg.hasClass("message-info")) {
			var text = msg.text();
        
	        // Someone entered the room
	        if (Bot.enableWelcome && text.indexOf(' joined the room.') !== -1) {
	            var username = text.slice(0, text.indexOf(' joined the room.'));
	            internal.sendMessage(Bot.welcome.replace("{{USER}}", username));
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

		if (command.length) command = command[0];

		if (commands[command] !== undefined) {
			commands[command].callback.apply(commandUtil, data);
		}
	}

	internal.sendMessage = function(msg, sender) {
		$('.user-color-item').eq(0).attr('data-color', '#FFFFFF').trigger('click');
		internal.waitingMessages += 1;
		setTimeout(function() {
			textarea.val((sender || Bot.name) + ": " + msg);
			submit.trigger("click");
			internal.waitingMessages -= 1;
		}, 500);
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
				var message = internal.messageQueue.shift();
				internal.processMessage(message);
			}
		}

		if (internal.waitingMessages === 0) {
			setTimeout(function() {
				if (internal.waitingMessages === 0) {
					$('.user-color-item').eq(0).attr('data-color', initialColor).trigger('click');
				}
			}, 1000);
		}

		setTimeout(internal.update, 300);
	}



	commandUtil.sendMessage = function(msg, sender) {
		internal.sendMessage(msg, sender || Bot.name);
	}



	Bot.setCommand = function(cmd, callback, help) {
		var funcRegex = /\((.+|)\)(?: |){([^]+)}/;
		/* funcStuff[1] is the functions parameters, funcStuff[2] is the body */
		var funcStuff = callback.toString().match(funcRegex);

		var data = funcStuff[1].split(/(?:, |,)/g);
		data.push("with(this){" + funcStuff[2] + "}");

		commands[cmd] = {
			callback: Function.apply({}, data),
			help: help || "No documentation supplied"
		};
	}

	Bot.runCommand = function(cmd, args) {
		if (commands[cmd] !== undefined) {
			commands[cmd].callback.apply(commandUtil, args);
		}
	}

	Bot.testCommand = function(cmdString) {
		internal.runCommand(cmdString);
	}

	Bot.sendMessage = internal.sendMessage;



	Bot.setCommand("help", function() {
		var message = "";
		console.log(commands);
		for (var i in commands) {
			message += commands[i].help;
		}
		console.log("Helpful message!");
		sendMessage(message);
	}, "Prints documentation for all commands");



	setTimeout(internal.update, 1);



	return Bot;
})();

Bot.setCommand("add", function(a, b) {
	sendMessage(a + " plus " + b + " equals " + (parseFloat(a) + parseFloat(b)))
}, "Adds two numbers. Usage /add a b");

Bot.setCommand("subtract", function(a, b) {
	sendMessage(a + " minus " + b + " equals " + (parseFloat(a) - parseFloat(b)))
}, "Subtracts one number from another. Usage /subtract a b");