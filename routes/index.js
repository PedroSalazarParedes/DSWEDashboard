const express = require("express");
var request = require("request"); // "Request" library
const router = express.Router();

const MyMongoLib = require("../MyMongoLib.js");

const myMongoLib = MyMongoLib();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});
//Ejemplo de John Borrar cuando este listo
router.get("/data", (req, res) => {
  myMongoLib
    .getDocs()
    .then(doc => res.send(doc))
    .catch(err => res.send({ err: true, msg: err }));
});
router.post("/claim", (req, res) => {
  myMongoLib
    .getClaimById(req.body._id)
    .then(docs => res.send(docs))
    .catch(err => res.send({ err: true, msg: err }));
});
router.post("/claims", (req, res) => {
  myMongoLib
    .getClaimsByUser(req.body.type, req.body.user)
    .then(docs => res.send(docs))
    .catch(err => res.send({ err: true, msg: err }));
});
router.post("/addclaim", function(req, res) {
  var complain = req.body;
  complain.state = "Pendiente";
  myMongoLib
    .postComplain(complain)
    .then(docs => res.send(docs))
    .catch(err => res.send({ err: true, msg: err }));
});
router.post("/addanswer", function(req, res) {
  let answer = req.body.answer;
  let mongoId = req.body._id;
  let state = req.body.state;
  let teacher = req.body.teacher;
  myMongoLib
    .postAnswer(mongoId, answer, state, teacher)
    .then(docs => res.send(docs))
    .catch(err => res.send({ err: true, msg: err }));
});


router.get("/grupo", (req, res) => {
  if(req.query && req.query.seccion && req.query.grupo){
    let seccion = parseInt(req.query.seccion);
    let grupo = req.query.grupo;
    myMongoLib
    .getGrupo(seccion,grupo)
    .then(info => {
      if(info === null){
        var options = {
          url: "https://script.google.com/macros/s/AKfycbyaYhNNZ1Do_o4sI6mzFkzoDGr_UjJs1vZbrtk28Eye7JxXlAE/exec?seccion="+seccion+"&grupo="+grupo,
        };
        request.get(options, function(error, response, body) {
          if(!error){
            var grupoJSON = JSON.parse(body).seccion;
            myMongoLib
            .postGrupo(grupoJSON)
            .then(docs => res.json(grupoJSON))
            .catch(err => res.send({ err: true, msg: err }));
          }
          else{
            res.send(error);
          }
        });
      }
      else{
        console.log("existe")
        res.json(info);
      }
    })
    .catch(err => {
      console.log(err);
    });
  }
});



router.post("/login", function(req, res) {
  var options = {
    url: "https://script.google.com/macros/s/AKfycbyaYhNNZ1Do_o4sI6mzFkzoDGr_UjJs1vZbrtk28Eye7JxXlAE/exec?usuario="+req.body.username,
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    if(!error){
      res.json(body);
    }
    else{
      res.send(error);
    }
  });
});

module.exports = router;
