var express = require('express');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var app = express();
var port = process.env.PORT || 3000;
var router = express.Router();
var mongodb= require("mongodb");
var MongoClient = mongodb.MongoClient;
var urldb = 'mongodb://urlshort:78292725@ds127993.mlab.com:27993/israelmarmar';      
var urlapi="https://www.googleapis.com/customsearch/v1?key=AIzaSyCqU_ob0so59D5vvWMANSH_iiqS0hUJGrQ&cx=004314060325951839611:2r8fh7j6zh8&searchType=image&fileType=jpg&alt=json&q=";

function Get(yourUrl){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

router.get('/api/imagesearch/:query', function (req, res) {
	var offset=req.query.offset;
	var array=[];
	
	
	var json_obj = JSON.parse(Get(urlapi+req.params.query+"&num="+offset));
	json_obj=json_obj["items"];
	
	for(var i=0;i<=offset-1;i++){
		array.push({url: json_obj[i]["link"], snippet: json_obj[i]["snippet"], thumbnail: json_obj[i]["image"]["thumbnailLink"], context: json_obj[i]["image"]["contextLink"]});
	}
	
	 MongoClient.connect(urldb, function (err, db) {
  if (err) throw err;
  
  db.collection("imghis").insert({ term:  req.params.query, when: new Date(Date.now()).toLocaleString()}, function(err, res) {
    if (err) throw err;
	
    db.close();
   });
  
	 });
	
res.json(JSON.parse(JSON.stringify(array)));

});

router.get('/api/latest/imagesearch/', function (req, res) {
	var array=[];
	
	MongoClient.connect(urldb, function(err, db) {
  if (err) throw err;
  var mysort = { when: 1 };
  db.collection("imghis").find().sort(mysort).toArray(function(err, result) {
    if (err) throw err;
	
    for(var i=result.length-1;i>=0;i--){
		array.push({term: result[i]["term"], when: result[i]["when"]});
	}
	
	res.json(JSON.parse(JSON.stringify(array)));
    db.close();
  });
});
	
});


app.listen(port, function () {
 console.log("ligado");
});

app.use('/', router);