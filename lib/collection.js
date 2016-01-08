Websites = new Mongo.Collection("websites"),
WebsitesIndex = new EasySearch.Index({
	collection : Websites,
	fields: ['title'],
	engine: new EasySearch.MongoDB()
});

Posts = new Mongo.Collection("posts");

