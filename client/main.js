

	/////
	// Routing 
	/////	
	Router.configure({
		layoutTemplate: 'ApplicationLayout'
	});

	Router.route('/', function () {
	  this.render('ranking',{
	  	to:'main'
	  });
	  this.render('navbar',{
	  	to:"navbar"
	  });
	  this.render('jumbotron',{
	  	to:"jumbotron"
	  });
	  this.render('footer',{
	  	to:"footer"
	  })

  
	});

	Router.route('/details/:_id', function () {
	  this.render('website_detail',{
	  	to:'main',
	  	data: function(){
	  		return Websites.findOne({_id:this.params._id});
	  	}
	  });
	  this.render("navbar",{
	  	to:"navbar"
	  });
	  this.render('footer',{
	  	to:"footer"
	  })
	 });

	/////
	// Accounts
	/////
Accounts.ui.config({
  passwordSignupFields:"USERNAME_AND_EMAIL"
});

	
	/////
	// template helpers 
	/////
	Template.searchBox.helpers({
		websitesIndex: () => WebsitesIndex
	})

	// helper function that returns all available websites
	Template.website_list.helpers({
		websites:function(){
			return Websites.find({}, {sort:{countUp:-1}});
		}
	});
	Template.website_item.helpers({
		countUp:function(){
			var countUp = Websites.findOne({_id:this._id});
			return countUp.countUp;
		},
		countDown:function(){
			var countDown = Websites.findOne({_id:this._id});
			return countDown.countDown;
		}
	});
	Template.website_detail.helpers({
		post:function(){
			
				return Posts.find({title:this.title}, {sort:{}})
		},
		
		
	});// End Template.website_detail.helpers

	Template.single_post.helpers({
		getUser:function(user_id) {
    		var user = Meteor.users.findOne({_id:user_id});
    		return user.username
    	},
    	
    }); // End Template.single_post.helpers
 

	/////
	// template events 
	/////
	Template.website_item.events({

		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			Session.set("counterUp",this.countUp)
			console.log(Session.get("counterUp"));
			if(Meteor.user() && !Websites.findOne({_id:this._id,like:Meteor.user()._id})){
				var whitespace = ' ';
				var $selector =$('li'+ '#' +this._id + whitespace + '.info-like');
				$selector.addClass('info-success').html("Your vote has been added successfully").fadeOut(4000,function(){
					$selector.html("").removeClass('info-success').css('display','inline-block')

				});
				var website_id = this._id;
				console.log('l\'id du site est ' + website_id)
				Websites.update({"_id":website_id},{$inc:{countUp:1}, $push:{like:Meteor.user()._id}});
				console.log(Meteor.user()._id +"Up voting website with id " + website_id);
				console.log(Meteor.user());
				if(Websites.findOne({_id:this._id,unlike:Meteor.user()._id})){
					Websites.update({"_id":website_id},{$pull:{unlike:Meteor.user()._id},$inc:{countDown:-1}});
				}
			}

			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			Session.set("counterDown",this.countDown)
			console.log(Session.get("counterDown"));
			if(Meteor.user() && !Websites.findOne({_id:this._id,unlike:Meteor.user()._id})){
				var whitespace = ' ';
				var $selector =$('li'+ '#' +this._id + whitespace + '.info-like');
				$selector.addClass('info-fail').html("Your vote has successfully been added").fadeOut(4000,function(){
					$selector.html("").removeClass('info-fail').css('display','inline-block')
				});
				var website_id = this._id;
				Websites.update({"_id":website_id},{$inc:{countDown:1}, $push:{unlike:Meteor.user()._id}});
				console.log("Down voting website with id " + website_id);
				if(Websites.findOne({_id:this._id,like:Meteor.user()._id})){
					Websites.update({"_id":website_id},{$pull:{like:Meteor.user()._id},$inc:{countUp:-1}});
				}
			}

			return false ;// prevent the button from reloading the page
		}
	})

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
			$('.info_form').addClass('hidden')
			$(".errorMatch").addClass("hidden");
			$("input").val("");
		},
		"submit .js-save-website-form":function(event){

			// here is an example of how to get the url out of the form:
			var url = event.target.url.value;
			var title = event.target.title.value;
			Session.set('website', url);
			console.log("The url they entered is: " + url);
			var description = event.target.description.value;
			console.log("The description they entered is: " + description);


				if(!Websites.findOne({url:url}) && url != "" && title !="" && description != "" && Meteor.user()){
					Websites.insert({
						url : url,
						description : description,
						title:title,
						createdAt: new Date(),
      					createdBy: Meteor.user()._id,
      					countUp : 0,
      					countDown:0,
      					like:[],
      					unlike:[]
					})
					$("#website_form").toggle('slow');
				}
				else if(Websites.findOne({url:url}) ){
					$('.info_form').removeClass('hidden').html("<b>This website has already been added</b>")
				}
				else{
					$('.info_form').removeClass('hidden').html('<b>Please fill in ALL the form</b>');
				}
			//  put your website saving code in here!	

			return false;// stop the form submit from reloading the page

		},
		"click #js-websiteInfo":function(event){
			var url= $("#url").val();
			extractMeta(url, function (err,res){
				console.log(res);
				console.log(res.title);
				$('#title').val(res.title);
				$('#description').val(res.description);
				});
		},

		
	}); // End of Template.website_form.events
	

	Template.website_detail.events({
		"submit .js-post-comment":function(event){
			var post = event.target.post.value;
			var title = this.title
			console.log("your comment: " + post)
			console.log(title);
				if(Meteor.user() && post != ""){
					Posts.insert({
						post: post,
						createdAt: new Date(),
						createdBy: Meteor.user()._id,
						title:title,

					});

				}
		$('.message-container').scrollTop($('.message-container')[0].scrollHeight);
		$('#typeMessage').val("");
		return false;
				
		
		}
	});
;

	/////
	// jQuery
	/////

$(function(){
	$('.message-container').scrollTop($('.message-container').scrollHeight);
	$('.js-post-comment').click(function(){
	
	})

});
  
