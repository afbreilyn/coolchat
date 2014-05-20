Chats = new Meteor.Collection("chats");
Users = new Meteor.Collection("users");

if (Meteor.isClient) {
  Meteor.startup(function() {
    var user_id = Users.insert({
      last_action: Date.now(),
      ping_time: Date.now(),
      username: "Cool dude"
    });
    Session.set("user_id", user_id);
    Session.set("logged_in", Date.now());
    Session.setDefault("resetName", "");
    
    Meteor.setInterval(function() {
      Users.update(Session.get("user_id"), {$set: {ping_time: Date.now()}});
    }, 5000);
  });

  var username = function() {
    var user = Users.findOne(Session.get("user_id"));
    return user && user.username;
  };

  var voiceSwitch = false;

  Template.user.selected = function() {
    return (this._id === Session.get("user_id")) ? "selected" : "";
  };
  
  Template.user.catIcon = function() {
    if (Date.now() - 30000 > this.last_action) {
      // do something denoting that they are not logged in
    } else {
      // show that they're online
    }
  };

  Template.chatRoom.events({
    "submit form#username": function(event) {
      event.preventDefault();
      
      var username = $("input#username").val();
      Users.update(Session.get("user_id"), {$set: {
        username: username,
        last_action: Date.now()
      }});
      Session.set("changeName", "");
    },
    
    "click .reset-username": function(event) {
      event.preventDefault();
      
      Session.set("changeName", "true");
    }
  });

  Template.chatRoom.users = function() {
    return Users.find();
  };
  
  Template.chatRoom.chats = function() {
    return Chats.find({time_created: {$gt: Session.get("logged_in")}});
  };

  Template.chatRoom.changeName = function() {
    return Session.get("changeName");
  };
  
  Template.chatRoom.username = function() {
    return username();
  };
  
  Template.chat.rendered = function() {
    var $chats = $("ul#chats");
    var scrollPos = 0;

    // console.log($chats);

    $chats.find("li").each(function() {
      scrollPos += $(this).height();
    })

    $chats.scrollTop(scrollPos);
  };

  Template.newMessage.events({
    "submit form.new-message": function(event) {
      event.preventDefault();
      
      var $message = $("input#message");
      var message = ($message.val() === "") ? "nothing" : $message.val();
      
      // console.log(username());

      var x = Chats._collection.queries[2].results.length;
      var y = Chats._collection.queries[2].results[x - 1];

      if (y) { 
        if (username() !== y.username) {
          // console.log("user who is talking changed")
        }
      };

      Chats.insert({
        message: message,
        username: username(),
        time_created: Date.now()
      });
      Users.update(Session.get("user_id"), {$set: {last_action: Date.now()}})
      $message.val("");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.setInterval(function() {
      Users.remove({ping_time: {$lt: Date.now() - 10000}});
    }, 10000);
  });
}