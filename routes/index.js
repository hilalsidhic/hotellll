var express = require('express');
var router = express.Router();
var dbsql=require('../config/sqlconnection')
var customerhelper = require('../helpers/customer-helpers')
const bcrypt = require('bcrypt');
const { Router } = require('express');
const { log } = require('handlebars');

let admin; 



/* GET home page. */
router.get('/', function(req, res, next) {
 
let users= req.session.user;
console.log(users);
res.render('index',{users})
})
router.get('/signin', function(req, res, next) {
 
    res.render('signin');
  
 });
 router.get('/userhome', function(req, res, next) {
   let user=req.session.user;
   let users= req.session.user;
   let Emails= users.Email
   dbsql.query('SELECT * FROM users WHERE email= ?',Emails,function(error,results,fields){
     console.log(results[0]);
  res.render('user-signin',{user,customer : results[0]});})
 });
 router.get('/signup',function(req,res,next){
   res.render('signup')
 })
 router.get('/admin',function (req,res,next){
   admin=1;
   dbsql.query('SELECT * FROM users ORDER BY roomno ASC',function(err,row,field){
   res.render('admin-signin',{customer : row})
   })
 })

 router.post('/loginaction', function(req, res) {
   let loginstatus=false;
  var Emails=req.body.Email;
  var Passwords=req.body.Password;
  if (Emails && Passwords) {
    admin=0;
		dbsql.query('SELECT * FROM logindetails WHERE Email = ?',Emails,async function(error, result, fields) {
      console.log(result[0].password);
      if(await bcrypt.compare(Passwords,result[0].password)){
        req.session.loggedIn=true;
        req.session.user=result[0];
        var user=req.session.user;
        dbsql.query('SELECT * FROM users WHERE email= ?',Emails,function(error,results,fields){
          console.log(results[0]);
          res.render('user-signin',{user,customer : results[0]});

        })
       
      
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
})
router.get('/signout',function (req,res) {
   req.session.destroy();
   res.redirect('/')
})
router.post('/signupaction',async function (req,res){
  var ps=req.body.password
  var password=await bcrypt.hash(ps,10)
  var email= req.body.Email;
  
  if(email && ps){
  dbsql.query('SELECT * FROM logindetails WHERE Email = ?',email,function(err,rows,field){
    console.log(rows.length);
    if(rows.length){
      res.send('helo')
  }
  else {
    var data={
      Email: req.body.Email,
      Password: password
  
    }
     dbsql.query('INSERT INTO logindetails SET ?',data,function(err,row,field){
       res.render('signin')
     })
    
  }
})
  }

 else{
   window.alert('Input email and password')
 }
  

})




 // if(dbsql.query('SELECT * FROM logindetails WHERE Email = Emails AND password = Passwords')==0){
   // console.log(req.body)
  //}
// else{
// dbsql.query('SELECT * FROM users',function(err,row,field){
//
  //  res.render("admin-signin",{customer : row})
 // })
 // }
 //});


 router.post('/booking', function(req, res, next) {
   admin=0;
   console.log(req.body.person)
   var checkin= req.body.check_in_date; 
   var checkout= req.body.check_out_date;
   var person= req.body.person;
  res.render('booking',{checkin,checkout,person});
 });
 router.get('/deleteuser/:id', function (req, res) {
  dbsql.query('DELETE FROM users WHERE id = ?', req.params.id, function (err, row) {
      if (err)
          throw err;
      
          dbsql.query('SELECT * FROM users',function(err,row,field){

            res.render("admin-signin",{customer : row})
          })
  });
});
router.get('/updateuser/:id', function (req, res) {
  dbsql.query('SELECT * FROM users WHERE ID = ?', req.params.id, function (err, row) {
      if (err)
          throw err;
      
      res.render('booking_update', {customer: row[0], id : req.params.id});
  });
});
router.post('/updateuser/:id', function (req, res) {
  var data = {
     roomno: req.body.roomno,
     name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    street: req.body.street,
    country: req.body.country,
    bedding: req.body.bed,
    person: req.body.person,
    room: req.body.room,
    arrive: req.body.arrive,
    depart: req.body.depart,
    comments: req.body.comments,
    streetnumber: req.body.streetnumber,
    postcode: req.body.postcode,
    city :req.body.city
  };
  var ids=req.body.id;
 
  
  dbsql.query('UPDATE users SET ? WHERE id = ?',[data,ids], function (err, row, fields) {
    
    if (err)
          throw err;
          var email=req.body.email;

          dbsql.query('SELECT * FROM users ORDER BY roomno ASC',function(err,row,field){
            if(req.session.loggedIn){
              dbsql.query('SELECT * FROM users WHERE email= ?',email,function(error,results,fields){
              var user=req.session.user;
              res.render('user-signin',{user,customer:results[0]})
            })}
            else if(admin){

            res.render("admin-signin",{customer : row})
            }
            else{
              res.redirect('/')
            }
          })   
          
  })
});
router.get('/messages',function (req,res) {
  dbsql.query('SELECT * FROM complaints',function(err,row,field){
    res.render('messages',{msg : row})

  })
})

router.post('/message',function (req,res) {
  var data={
    Name: req.body.FullName,
    Phone: req.body.Phone,
    Email: req.body.Email,
    Message: req.body.Message

  }
  console.log(data);
  dbsql.query('INSERT INTO complaints SET ?',data,function(err,row,field){
    
    res.redirect('/')
  })

})

 router.post('/bookingaction',function(req,res){
   
   var data={
     name: req.body.name,
     email: req.body.email,
     phone: req.body.phone,
     street: req.body.street,
     country: req.body.country,
     bedding: req.body.bed,
     person: req.body.person,
     room: req.body.room,
     arrive: req.body.arrive,
     depart: req.body.depart,
     comments: req.body.comments,
     streetnumber: req.body.street-number,
     postcode: req.body.post-code,
     city :req.body.city
     
    
   }
   dbsql.query('INSERT INTO users SET ?',data,function(err,row,field){
     if(admin){
     dbsql.query('SELECT * FROM users',function(err,row,field){

     res.render('admin-signin',{customer : row})
     })}
     else{
       res.render('signup')
     }
    
   }
     
   )});     
   
   
   

 router.get('/booking',function(req,res){
   admin=1;
   res.render('booking');
 });
 router.get('/deleteaction',function(req,res){
  customerhelper.deletecustomer().then((customer)=>{
    customerhelper.showcustomer().then((customer)=>{
      console.log(customer)
      res.render("admin-signin",{customer})
    })
  })
 })


  

module.exports = router;
