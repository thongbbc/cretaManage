var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 9999;
var mongoose = require("mongoose");
var bodyParser=require("body-parser")
var urlencodedParser=bodyParser.urlencoded({extended:false})
var Schema = mongoose.Schema;

import Expo from 'expo-server-sdk';

let expo = new Expo();

var account = new Schema({
    username:String,
    password: String,
    name:String,
    phone:String,
    rule:String,
    tokenNotification:String
});
var customer = new Schema({
    id:String,
    phone:String,
    name: String,
    address: String,
    location:String,
    cost:String,
    note:String,
    employee:String,
    check:String,
    by:String,
    time:String,
});

var account = mongoose.model("Account",account);
var customer = mongoose.model("Customer", customer);
const password = '123'
mongoose.connect("mongodb://root:123@ds249727.mlab.com:49727/cretamanage", { useMongoClient: true });

app.set("view engine", "ejs");
app.set("views","./views");
app.use(express.static("public"));
app.use(express.static("assets"));


app.get("/",function(req,res){
    res.render('trangchu')
})

async function chunkFunction(chunks) {
  for (let chunk of chunks) {
        try {
          let receipts = await expo.sendPushNotificationsAsync(chunk);
          console.log(receipts);
        } catch (error) {
          console.error(error);
        }
      }
}

function getTimeStamp() {
  var d = new Date();
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000*7)) / 1000;
}
function getDayOfWeek(timeStamp) {
  var date = new Date(timeStamp*1000)
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var dayOfWeek = days[date.getDay()]
  return dayOfWeek
}
function getDay(timeStamp) {
  var date = new Date(timeStamp*1000)
  var day = date.getDate()
  return day
}
function getMonth(timeStamp) {
  var date = new Date(timeStamp*1000)
  var month = date.getMonth() + 1
  return month
}
function getYear(timeStamp) {
  var date = new Date(timeStamp*1000)
  var year = date.getFullYear()
  return year
}
function getHours(timeStamp) {
  var date = new Date(timeStamp*1000)
  var hours = date.getHours()
  return hours;
}
function getMinutes(timeStamp) {
  var date = new Date(timeStamp*1000)
  var minutes = date.getMinutes()
  return minutes;
}
function getSeconds(timeStamp) {
  var date = new Date(timeStamp*1000)
  var seconds = date.getSeconds()
  return seconds;
}


app.post("/pushNotificationWithUsername",urlencodedParser,function pushNotification(req, res) {
  const {message,data} = req.body;
  account.find({}, function(err, data2) {
    var arrayUsername = req.body.username
    if (data2.length!=0) {
      let messages = [];
      for (var i=0 ;i< arrayUsername.length;i++) {
        const value = data2.find((value)=>value.username==arrayUsername[i].username);
        if (!Expo.isExpoPushToken(value.tokenNotification)) {
          console.error(`Push token ${data2[i].tokenNotification} is not a valid Expo push token`);
          continue;
        }
        messages.push({
          to: value.tokenNotification,
          sound: 'default',
          body: message,
          data: { data: data },
        })        
      }
      let chunks = expo.chunkPushNotifications(messages);
      chunkFunction(chunks)
      console.log("SUCCESS")
      res.json({status:'OK'})
    } else {
      console.log("ERROR NOTIFICATION")
      res.send({status:'ERROR'})
    }
  })
  
})


app.post("/pushNotificationAll",urlencodedParser,function pushNotification(req, res) {
  const {message, data} = req.body;
  account.find({}, function(err, data) {
    if (data.length!=0) {
      let messages = [];
      for (var i=0 ;i< data.length;i++) {
        if (!Expo.isExpoPushToken(data[i].tokenNotification)) {
          console.error(`Push token ${data[i].tokenNotification} is not a valid Expo push token`);
          continue;
        }
        messages.push({
          to: data[i].tokenNotification,
          sound: 'default',
          body: 'This is a test notification',
          data: { withSome: 'data' },
        })        
      }
      let chunks = expo.chunkPushNotifications(messages);
      chunkFunction(chunks)
      console.log("SUCCESS")
      res.json({status:'OK'})
    } else {
      console.log("ERROR NOTIFICATION")
      res.send({status:'ERROR'})
    }
  })
  
})

app.post("/changeOwner",urlencodedParser,function(req,res){
  if (req.body.password == password){
    customer.update({id:req.body.id},{$set: {employee:req.body.employee}}, function(err) {
        if (!err) {
          res.send({status:'OK'})
        } else {
          res.send({status:'ERROR'})
        }
    })
  } else {
    res.send({status:'ERROR'})
  }
})

app.post("/registerTokenNotification",urlencodedParser,function(req,res){
  account.find({tokenNotification:req.body.tokenNotification}, function(err, data) {
    if (data.length!=0) {
      res.send({status:'ERROR'})
    } else {
      account.update({username:req.body.username},{$set: {tokenNotification:req.body.tokenNotification}}, function(err) {
          if (!err) {
            res.send({status:'OK'})
          } else {
            res.send({status:'ERROR'})
          }
      })
    }
  })
})

app.post("/allAccountLevel0",urlencodedParser,function(req,res){
  if (req.body.password == password){
    account.find({rule:"0"}, function(err, data) {
      if (!err)
        if (data.length!=0) {
          res.send({status:'OK',data:data})
        } else {
          res.send({status:'OK'})
        } 
      else {
        res.send({status:'ERROR'})
      }
    })
  } else {
      res.send({status:'ERROR'})
  }
})


app.post("/login",urlencodedParser,function(req,res){
  account.find({username:req.body.username,password:req.body.password}, function(err, data) {
    if (!err)
    if (data.length!=0) {
      res.send({status:'OK',rule:data[0].rule})
    } else {
      res.send({status:'ERROR'})
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
app.post('/addCustomer',urlencodedParser,function(req,res) {
  var idRandom = "";
  var timeStamp = getTimeStamp()
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    idRandom += possible.charAt(Math.floor(Math.random() * possible.length));
  var Customer = customer({
    id:"CRE"+idRandom,
    phone:req.body.phone,
    name: req.body.name,
    address: req.body.address,
    location:req.body.location,
    cost:req.body.cost,
    note:req.body.note,
    employee:req.body.employee,
    check:0,
    by:req.body.by,
    time:timeStamp.toString()
  });
    Customer.save(function(err) {
        if (err) {res.send({status:"ERROR"})};
        res.send({status:'OK'})
        console.log("Da them vao database");
    });
})

app.post('/removeCustomer',urlencodedParser,function(req,res) {
  if (req.body.password == password){
    customer.remove({id:req.body.id},function(err){
        if (!err) {
          res.send({status:'OK'})
        } else {
          res.send({status:'ERROR'})
        }
      })
  } else {
    res.send({status:'ERROR'})
  }    
})


app.get('/removeAllCustomer',function(req,res) {
      customer.remove({},function(err){
        if (!err) {
          res.send({status:'OK'})
        } else {
          res.send({status:'ERROR'})
        }
      })

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
app.post('/allCustomer',urlencodedParser,function(req,res) {
  if (req.body.password == password){
    customer.find({}, function(err, data) {
        if (data.length!=0) {
          res.send({status:'OK',data:data})
        } else {
          res.send({status:'OK'})
        }
    })
    } else {
      res.send({status:'ERROR'})
    }
})
app.post('/checkCustomer',urlencodedParser,function(req,res) {
    if (req.body.password == password){
      customer.update({id:req.body.id},{$set: {check:req.body.check}}, function(err) {
          if (!err) {
            res.send({status:'OK'})
          } else {
            res.send({status:'ERROR'})
          }
      })
    } else {
      res.send({status:'ERROR'})
    }
})

app.post('/saveNote',urlencodedParser,function(req,res) {
    if (req.body.password == password){
      customer.update({id:req.body.id},{$set: {note:req.body.note}}, function(err) {
          if (!err) {
            res.send({status:'OK'})
          } else {
            res.send({status:'ERROR'})
          }
      })
    } else {
      res.send({status:'ERROR'})
    }
})

app.post('/editCustomer',urlencodedParser,function(req,res) {
  if (req.body.password == password){
      customer.update({id:req.body.id},{$set: {
        phone:req.body.phone,
        name: req.body.name,
        employee:req.body.employee
      }}, function(err) {
          if (!err) {
            res.send({status:'OK'})
          } else {
            res.send({status:'ERROR'})
          }
      })
    } else {
      res.send({status:'ERROR'})
    }
})

app.post('/findCustomer',urlencodedParser,function(req,res) {
  if (req.body.password == password){
    customer.find({id:req.body.id}, function(err, data) {
        if (data.length!=0) {
          res.send({status:'OK',data:data})
        } else {
          res.send({status:'ERROR'})
        }
    })
    } else {
      res.send({status:'ERROR'})
    }
})

app.post('/listCustomer',urlencodedParser,function(req,res) {
  if (req.body.password == password){
    customer.find({}, function(err, data) {
        if (data.length!=0) {
          var listContract = []
          for (var i =0 ;i<data.length;i++) {
            var jsonEmployee = JSON.parse(data[i].employee)
            for (var j =0 ;j<jsonEmployee.length;j++) {
              if (jsonEmployee[j].username == req.body.username) {
                listContract.push(data[i])
              }
            }
          }
          res.send({status:'OK',data:listContract})
        } else {
          res.send({status:'OK'})
        }
    })
    } else {
      res.send({status:'ERROR'})
    }
})


io.on('connection', function(socket) {
    var username = "";
    console.log('A user connected');

});

http.listen(port, function() {
    console.log('listening on localhost:' + port);
});
