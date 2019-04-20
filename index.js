var listuser={};
var express=require("express");
var app=express();
var checkvaild=function(dat1)
{
  showlog("checkvaild:"+ dat1);
  if(dat1==undefined||dat1==null) return false;
  else
   if(dat1.trim()=="") return false;
  else return true;
};
var showlog=function(dat)
{
  console.log(dat);
};

var datetimeNow=function ()
{
  var currentdate = new Date(); 
  var datetime =  currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear() + " @ "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
  return datetime;

};
app.use(express.static("public"));   // cho phep thu muc pubic la tai nguyen public , mn co the truy cap vao dk
app.set("view engine","ejs");   // cho phep su dung duoi ejs
app.set("views","./views");   // cho phep su dung views la thu muc chua file view html
var server=require("http").createServer(app);
const io1=require("socket.io")(server);
server.listen(3000);

app.get("/",function(req,res){
  res.render("chathome");  // tra ve file html xuong client

});

io1.on("connection",function(socket){
     showlog("anyone connected:"+socket.id);
  
     var SKeventList= {
       "disconnect":function() {
        showlog("anyone disconnected:"+socket.id);
 
         },
         "login":function(dat){
          try
          {
            showlog("login->"+JSON.stringify(dat));
            if(checkvaild(dat.user))
            {
                listuser[dat.user]={user:dat.user,socketid:socket.id};
                socket.emit("ntf",{user:dat.user,ntf:"welcome to Chat chit"});
            }
          }
          catch(e) { console.log(e)}
         },
         "getonlinelist":function()
         {
           try {
            showlog("getonlinelist");
            socket.emit("getonlinelist",listuser);
           } catch (er) {
            showlog(er);
           }
         
         },
         "sendmess":function(dat)
         {
           try {
            showlog("sendmess->"+JSON.stringify(dat));
            if(typeof dat ==="object")
            {

              var messobj={
                fromuser:dat.fromuser,
                touser:dat.touser,
                mess:dat.mess,
                type:dat.type,
                datetime:datetimeNow()
              };
              // send myself
              socket.emit("sendmessmyself",messobj);
              // send friend
              try {
                showlog("send friend-> friend:"+messobj.touser+",socketid:"+listuser[messobj.touser].socketid);
                 io1.sockets.connected[listuser[messobj.touser].socketid].emit("receivermess",messobj);
            
              } catch (er) {
                showlog(er);
                socket.emit("ntf","Friend "+messobj.touser+" not exist");
              }
             
            }
          
           } catch (er) {
            showlog(er);
           }
        

         }

     };



    socket.on("disconnect",SKeventList["disconnect"]);
    socket.on("login",SKeventList["login"]);
    socket.on("getonlinelist",SKeventList["getonlinelist"]);
    socket.on("sendmess",SKeventList["sendmess"]);
});




