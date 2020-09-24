/////////////////////////////////////////
// Safety: Uncomment everything to use //
/////////////////////////////////////////

// dependencies
var _ = require("lomath");

// API as superclass that bot inherits methods from
var API = require(__dirname + "/API.js");

// The bot object prototype
// bot extends and inherits methods of API
var bot = function (token, webhookUrl) {
  API.apply(this, arguments);
  // set webhook on construction: override the old webhook
  this.setWebhook(webhookUrl || "");
};

// set prototype to API
bot.prototype = API.prototype;
// set constructor back to bot
bot.prototype.constructor = bot;

/**
 * Handles a Telegram Update object sent from the server. Extend this method for your bot.
 *
 * @category Bot
 * @param {Object} req The incoming HTTP request.
 * @param {Object} res The HTTP response in return.
 * @returns {Promise} promise A promise returned from calling Telegram API method(s) for chaining.
 *
 * @example
 * var bot1 = new bot('yourtokenhere');
 * ...express server setup
 * app.route('/')
 * // robot API as middleware
 * .post(function(req, res) {
 *     bot1.handle(req, res)
 * })
 * // Then bot will handle the incoming Update from you, routed from Telegram!
 *
 */
bot.prototype.handle = function (req, res) {
  // the Telegram Update object. Useful shits
  var Update = req.body,
    // the telegram Message object
    Message = Update.message,
    // the user who sent it
    user_id = Message.from.id,
    // id of the chat(room)
    chat_id = Message.chat.id;

  var botAux = this;
  ////////////////////////
  // Extend from here:  //
  ////////////////////////
  // you may call the methods from API.js, which are all inherited by this bot class

  // echo
  var http = require("http");
  if (
    Message.text == "random" ||
    Message.text == "science" ||
    Message.text == "food" ||
    Message.text == "animal" ||
    Message.text == "dev"
  ) {
    var category = "all";
    if (
      Message.text == "science" ||
      Message.text == "food" ||
      Message.text == "animal" ||
      Message.text == "dev"
    ) {
      category = Message.text;
    }

    var options;
    if (Message.text == "random") {
      options = {
        host: "api.chucknorris.io",
        path: "/jokes/random",
      };
    } else {
      options = {
        host: "api.chucknorris.io",
        path: parse("/jokes/random?category=", category),
      };
    }

    callback = function (response) {
      var str = "";
      var data = "";
      //another chunk of data has been recieved, so append it to `str`
      response.on("data", function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on("end", function () {
        var data = JSON.parse(str);
        console.log(data);
        var joke = data.value;

        //to replace &quot to '
        var find = "&quot;";
        var re = new RegExp(find, "g");
        joke = joke.replace(re, '"');

        botAux.sendMessage(chat_id, joke, undefined, undefined, kb);
        console.log(data);
        console.log("------------");
        console.log(category);
      });
    };

    http.request(options, callback).end();
  } else {
    botAux.sendMessage(
      chat_id,
      "Select one of the values of the custom keyboard",
      undefined,
      undefined,
      kb
    );
  }
};

// export the bot class
module.exports = bot;

// sample keyboard
var kb = {
  keyboard: [["random"], ["science", "food"], ["animal", "dev"]],
  one_time_keyboard: true,
};

function parse(str) {
  var args = [].slice.call(arguments, 1),
    i = 0;

  return str.replace(/%s/g, function () {
    return args[i++];
  });
}
