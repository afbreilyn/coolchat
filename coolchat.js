var Chats = new Meteor.Collection("chats");

if (Meteor.isClient) {
  Meteor.startup(function () {
    Session.set("loggedIn", Date.now());
  });

  Template.chatRoom.chats = function () {
    return Chats.find({time_created: {$gt: Session.get("loggedIn")}});
  };

  Template.chatRoom.username = function() {
    return Session.get("username");
  };

  Template.chatRoom.events({
    "submit form#username": function(event) {
      event.preventDefault();
      var username = $("input#username").val();
      Session.set("username", username);
    },

    "click .reset-username": function(event) {
      event.preventDefault();
      Session.set("username", "");
    }

  });

  Template.newMessage.events({
    "submit form.new-message": function(event) {
      event.preventDefault();

      var $message= $("input#message");
      Chats.insert({
        message: $message.val(),
        username: Session.get("username"),
        time_created: Date.now()
      })
      $message.val("");
    }
  });



  Chats.find().observeChanges({
    added: function(id, fields) {
      var $chats = $("ul#chats");
      var $lastChat = $("ul#chats>li.chat:last-child");
      if ($lastChat && $lastChat.position()) {
        $chats.scroll();
        // $chats.scrollTop($lastChat.position().top + $lastChat.height());
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
