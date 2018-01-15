var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 9999;
var mongoose = require("mongoose");
var bodyParser=require("body-parser")
var urlencodedParser=bodyParser.urlencoded({extended:false})

var Schema = mongoose.Schema;

var account = new Schema({
    username:String,
    password: String,
    name:String,
    phone:String,
    rule:String,
});
var customer = new Schema({
    phone:String,
    name: String,
    address: String,
    location:String,
    cost:String,
    note:String,
    employee:String
});

var account = mongoose.model("Account",account);
var customer = mongoose.model("Customer", customer);

mongoose.connect("mongodb://root:123@ds249727.mlab.com:49727/cretamanage");

app.set("view engine", "ejs");
app.set("views","./views");
app.use(express.static("public"));





app.post("/login",urlencodedParser,function(req,res){
  account.find({username:req.body.username,password:req.body.password}, function(err, data) {
    if (data.length!=0) {
      res.send({status:'OK'})
    } else {
      res.send({status:'ERROR'})
    }
  })
})
//  /fakeDataDiemDanh?id=1&hoten=Thong&tenmonhoc=Hoa&time=12:20&date=14/9/1995&thu=Mon
app.post('/signUp',urlencodedParser,function(req,res) {
	var Account = account({
      username:req.body.username,
      password:req.body.password,
      rule:req.body.rule,
      phone:req.body.phone,
      name:req.body.name
		});
		Account.save(function(err) {
		    if (err) {res.send({status:"ERROR"})};
		    res.send({status:'OK'})
		    console.log("Da them vao database");
		});
})
app.post('/allCustomer',urlencodedParser,function(req,res) {
	if (req.body.password == '123')
	customer.find({}, function(err, data) {
	    if (data.length!=0) {
	      res.json(data)
	    } else {
	      res.send({status:'ERROR'})
	    }
  	})
	else {
		res.send({status:'ERROR'})
	}
})


app.get('/removeAccount',function(req,res) {
		 	account.remove({},function(err){
		 		if (!err) {
		 			res.send({status:'OK'})
		 		} else {
		 			res.send({status:'ERROR'})
		 		}
		 	})

})


io.on('connection', function(socket) {
    var username = "";
    console.log('A user connected');

});

http.listen(port, function() {
    console.log('listening on localhost:' + port);
});
