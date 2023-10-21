// loads several packages
const express = require('express');
const { engine } = require('express-handlebars');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectSqlite3 = require('connect-sqlite3');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express(); //creates the Express application
const http = require('http');
const fs = require('fs');
const exp = require("constants");
const port = 1405; //defines the port
let projectsExists = true;
let isLoggedIn = false;

// Set up the view engine
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));

// MODEL (DATA) 

//define database file
const db = new sqlite3.Database('database/database.db', (err) => {
  if (err) {
     return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
 });

//checking if project table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'", (error, row) => {
  if (error) {
     console.log("ERROR: ", error)
  } else if (row) {
     projectsExists = true;
     console.log("---> Table projects already exists.")
  } else {
     projectsExists = false;
     console.log("---> Table projects does not exist.")
      db.run("CREATE TABLE projects (pid INTEGER PRIMARY KEY, pname TEXT NOT NULL, pyear INTEGER NOT NULL, pdesc TEXT NOT NULL, ptype TEXT NOT NULL, pimgURL TEXT NOT NULL, videoLink TEXT)", (error) => {
        if (error) {
          // tests error: display error
          console.log("ERROR: ", error)
        }else{
          // tests error: no error, the table has been created
          console.log("---> Table projects created!")

          const projects=[
            {"id":"1","name":"Exchange in Sweden","year":2023, "desc": "The purpose of this project is to document my experience as an exchange student in Sweden.",
            "type":"Short film", "url":"/img/sweden.png", "link": "https://player.vimeo.com/video/860224475?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479"},
            {"id":"2","name":"Little One", "year":2023, "desc": "This is a compilation of clips from myself as a child and a meaningful speech.",
            "type":"Short film", "url":"/img/little one.png", "link": "https://player.vimeo.com/video/869184252?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479"},
            {"id":"3","name":"Schlafwandler Scene 2", "year":2022, "desc": "Schlafwandler is a german film project that I wrote and directed with the help of friends.",
            "type":"Short film", "url":"/img/Schlafwandler 2.png", "link": "https://player.vimeo.com/video/864893941?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479"},
            {"id":"4","name":"Schlafwandler Scene 4", "year":2022, "desc": "We never finished the Schlafwandler project but this is scene 4.",
            "type":"Short film", "url":"/img/Schlafwandler.png", "link": "https://player.vimeo.com/video/867142749?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479"},
            {"id":"5","name":"Campuskinotrailer", "year":2023, "desc": "Every second wednesday, the campus cinema takes place, for which we produce a trailer as a group. I directed this one and wrote the script.",
            "type":"Trailer", "url":"/img/Campuskinotrailer.png", "link": src="https://player.vimeo.com/video/869830187?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479"},
            {"id":"6","name":"Norway adventures", "year":2023, "desc": "We went to Norway some weeks ago and I tried to capture all the memories.",
            "type":"Short film", "url":"/img/Norway.png", "link": "https://player.vimeo.com/video/872289361?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479"},
          ]
          
          //inserts projects
          projects.forEach( (oneProject) => {
            db.run("INSERT INTO projects (pid, pname, pyear, pdesc, ptype, pimgURL, videoLink) VALUES (?,?,?,?,?,?,?)", 
            [oneProject.id, oneProject.name, oneProject.year, oneProject.desc, oneProject.type,
            oneProject.url, oneProject.link], (error) => {
              if (error){
                console.log("ERROR: ", error)
              } else {
                console.log("Line added into the projects table!")
              }
            })
          })
        }
      })
    }});

/* Table for users */
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (error, row) => {
if (error) {
    console.log("ERROR: ", error)
} else if (row) {
    usersExists = true;
    console.log("---> Table users already exists.")
} else {
    usersExists = false;
    console.log("---> Table users does not exist.")
    db.run("CREATE TABLE users (uid INTEGER PRIMARY KEY, uname TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, firstname TEXT, surname TEXT)", (error) => {
      if (error) {
        // tests error: display error
        console.log("ERROR: ", error)
      }else{
        // tests error: no error, the table has been created
        console.log("---> Table users created!")

        const users=[
          {"id":"1","username":"Kimberly", "email":"kimberly.eder@t-online.de", "pw":"$2b$12$GejmokEiExzyZOZ6FawfWeWVpgZMFvqlAHvz9WzzIQKLud4dvmAly",
          "firstname":"Kimberly", "surname":"Eder"}, //pw: 1234
          {"id":"2","username":"Moritz", "email":"moritz.eder@t-online.de", "pw":"$2b$12$EFRTmv0vXFP4kRLjpetNfO1H4PLpr2QhOyq0J1EhrJZKo8Rrvw.pm",
          "firstname":"Moritz", "surname":"Eder"}, //pw: 1111
          {"id":"3","username":"Harry", "email":"harry.potter@t-online.de", "pw":"$2b$12$d4pEu3eoY47SugQU6JOVn.sDkD5hNBF7wQCw11FrajdENFCKhgRn2",
          "firstname":"Harry", "surname":"Potter"}, //pw: 4545
          {"id":"4","username":"Hermine", "email":"hermine.granger@t-online.de", "pw":"$2b$12$jzq70E8QJ82Hrr35DiG6uugIAF6AtUmxIXxOoBznXFk8E42XQWuoW",
          "firstname":"Hermine", "surname":"Granger"}, //pw: 5432
          {"id":"5","username":"Ron", "email":"ron.weasly@t-online.de", "pw":"$2b$12$/zml4PDfkfc7V7ifvm/CzuzyyBWXvEVEYfW71Ra.HaSkEu5Rq0DTa",
          "firstname":"Ron", "surname":"Weasly"}, //pw: 2345
          ]
        
        //inserts users
        users.forEach( (oneUser) => {
          db.run("INSERT INTO users (uid, uname, email, password, firstname, surname) VALUES (?,?,?,?,?,?)", 
          [oneUser.id, oneUser.username, oneUser.email, oneUser.pw, oneUser.firstname,
          oneUser.surname], (error) => {
            if (error){
              console.log("ERROR: ", error)
            } else {
              console.log("Line added into the users table!")
            }
          })
        })
      }
    })
  }});

/* Table for screenplays */
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='screenplays'", (error, row) => {
  if (error) {
      console.log("ERROR: ", error)
  } else if (row) {
      screenplaysExists = true;
      console.log("---> Table screenplays already exists.")
  } else {
      screenplaysExists = false;
      console.log("---> Table screenplays does not exist.")
      db.run("CREATE TABLE screenplays (playid INTEGER PRIMARY KEY, playname TEXT NOT NULL, playdesc TEXT NOT NULL, playyear INTEGER NOT NULL, playgenre TEXT)", (error) => {
        if (error) {
          // tests error: display error
          console.log("ERROR: ", error)
        }else{
          // tests error: no error, the table has been created
          console.log("---> Table screenplays created!")
  
          const screenplays=[
            {"id":"1","name":"Schlafwandler", 
            "desc":
            "Eine junge Frau kämpft nachts mit dem seltsamen Verhalten ihres Freundes. Er leidet unter dem Phänomen der Mondsucht und bedroht sie im Schlaf. Am Morgen erinnert er sich an nichts oder etwa doch?",
            "year": 2022,
            "genre": "Thriller"},
            {"id":"2","name":"Trugbild", 
            "desc":
            "Ein Jugendlicher flüchtet sich aus Angst vor sozialer Ausgrenzung in seine Imagination und verliert die Realität aus den Augen. Seine Freunde necken ihn, doch für seine emotionale Instabilität wirkt es wie Mobbing. Was passiert, wenn er sich zu viele Gedanken darüber macht, was Andere von ihm denken?",
            "year": 2021,
            "genre": "Thriller"},
            {"id":"3","name":"Black & White", 
            "desc":"It´s a beautiful day to destroy patriarchy. Scenes in black and white show emotional images that challenge gender roles.", 
            "year": 2023,
            "genre": "Arthouse"},
            {"id":"4","name":"Spiegelung", "desc":"A story about the meaning of life told only through reflections in the water or glass, possibly also shadow images.", 
            "year": 2023,
            "genre": "Arthouse"},
            ]
          
          //inserts screenplays
          screenplays.forEach( (onePlay) => {
            db.run("INSERT INTO screenplays (playid, playname, playdesc, playyear, playgenre) VALUES (?,?,?,?,?)", 
            [onePlay.id, onePlay.name, onePlay.desc, onePlay.year, onePlay.genre], (error) => {
              if (error){
                console.log("ERROR: ", error)
              } else {
                console.log("Line added into the screenplays table!")
              }
            })
          })
        }
      })
    }});

/* Table for gallery pictures */
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='gallery'", (error, row) => {
  if (error) {
      console.log("ERROR: ", error)
  } else if (row) {
      galleryExists = true;
      console.log("---> Table gallery already exists.")
  } else {
      galleryExistsExists = false;
      console.log("---> Table gallery does not exist.")
      db.run("CREATE TABLE gallery (picid INTEGER PRIMARY KEY, picname TEXT NOT NULL, picyear INTEGER NOT NULL, picURL TEXT NOT NULL)", (error) => {
        if (error) {
          // tests error: display error
          console.log("ERROR: ", error)
        }else{
          // tests error: no error, the table has been created
          console.log("---> Table gallery created!")
  
          const gallery=[
            {"id":"1","name":"Schlafwandler 01", 
            "year": 2022,
            "URL": "/img/Schlafwandler.png"},
            {"id":"2","name":"Schlafwandler 02", 
            "year": 2022,
            "URL": "/img/Schlafwandler 2.png"},
            {"id":"3","name":"Campuskinotrailer 01", 
            "year": 2023,
            "URL": "/img/Campuskinotrailer.png"},
            {"id":"4","name":"Campuskinotariler 02", 
            "year": 2023,
            "URL": "/img/Campuskinotrailer2.png"},
            {"id":"5","name":"Little one 01", 
            "year": 2020,
            "URL": "/img/little one.png"},
            {"id":"5","name":"Little one 02", 
            "year": 2020,
            "URL": "/img/little one 2.png"},
            ]
          
          //inserts picture
          gallery.forEach( (oneGallery) => {
            db.run("INSERT INTO gallery (picid, picname, picyear, picURL) VALUES (?,?,?,?)", 
            [oneGallery.id, oneGallery.name, oneGallery.year, oneGallery.URL], (error) => {
              if (error){
                console.log("ERROR: ", error)
              } else {
                console.log("Line added into the gallery table!")
              }
            })
          })
        }
      })
    }});
    

//---------------
// SESSION
//---------------

//store sessions in the database
const SQLiteStore = connectSqlite3(session)

//define the session
app.use(session({
  store: new SQLiteStore({db: "session-db.db"}),
  "saveUninitialized": false,
  "resave": false,
  "secret": "TopSecret12nkewfnaopvsadjf!EQ=DADIANLNLYX283743"
}));

// CONTROLLER (THE BOSS)

//defines route "/" (Routing)
app.get('/', (req, res) => {
  console.log("SESSION: ", req.session)

  /*saltRounds = 12
  bcrypt.hash("1111", saltRounds, function(err, hash) {
    if (err) {
      console.log("Error encrypting the password: ", err)
    }else{
      console.log("Hashed password (GENERATE only ONCE): ", hash)
    }
  });*/

  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('layouts/main', model);
});

app.get('/home', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/home', model);
});

app.get('/about', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin, 
    description: "I´m a filmmaker, video editor, web designer and artist from Germany. I study media IT and film in Flensburg.",
  }
  res.render('partials/about', model);
});

app.get('/contact', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/contact', model);
});

app.get('/mycv-edu', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/mycv-edu', model);
});

app.get('/mycv-lang', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/mycv-lang', model);
});

app.get('/mycv-others', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }  
  res.render('partials/mycv-others'), model;
});

app.get('/mycv-skills', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/mycv-skills', model);
});

app.get('/mycv-work', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/mycv-work', model);
});

app.get('/description', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/description', model);
});

app.get('/newproject', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/newproject', model);
});

app.get('/secret', (req, res) => {
  console.log("SESSION: ", req.session)
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  }
  res.render('partials/secret', model);
});

//defines route "/projects"
app.get('/projects', (req, res) => {
  console.log("SESSION: ", req.session)
  db.all("SELECT * FROM projects", (error, theProjects) => {
    if (error) {
      const model ={
        dbError: true,
        theError: error,
        projects: [],
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      }
      // renders the page with the model
      res.render("partials/projects", model)
    }else{
      const model={
        dbError: false,
        theError: "",
        projects: theProjects,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      }
      res.render("partials/projects", model)
    }
  })
});

/*
//define route for paging
app.get('/projects/:page', (req, res) => {
  const numberPerPage = 3;
  const page = parseInt(req.params.page);

  let numberOfProjects;
  const numberOfProjectsQuery = 'SELECT COUNT(*) FROM projects';

  // Execute the query and retrieve the count
  db.query(numberOfProjectsQuery, (err, res) => {
    if (err) {
      console.error("Error executing database query:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      numberOfProjects = res[0]['COUNT(*)'];
      console.log("Number of Projects: ", numberOfProjects); 
    }
  });

  // Calculate first and last pages
  const firstPage = 1;
  const lastPage = Math.ceil(numberOfProjects / numberPerPage);

  // Check for valid page number
  if (page <= 0) {
    page = 1;
  } else if (page >= lastPage) {
    page = lastPage;
  }

  // Calculate previous and next pages
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < lastPage ? page + 1 : null;

  res.json({
    page,
    firstPage,
    lastPage,
    previousPage,
    nextPage,
  });
});
*/

//defines route "/screenplays"
app.get('/screenplays', (req, res) => {
  db.all("SELECT * FROM screenplays", (error, theScreenplays) => {
    if (error) {
      const model = {
        hasDatabaseError: true,
        theError: error,
        screenplays: [],
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      }
      // renders the page with the model
      res.render("partials/screenplays", model)
    }else{
      const model={
        hasDatabaseError: false,
        theError: "",
        screenplays: theScreenplays,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      }
      res.render("partials/screenplays", model)
    }
  })
});

//defines route "/gallery"
app.get('/gallery', (req, res) => {
  db.all("SELECT * FROM gallery", (error, theGallery) => {
    if (error) {
      const model = {
        hasDatabaseError: true,
        theError: error,
        gallery: [],
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      }
      // renders the page with the model
      res.render("partials/gallery", model)
    }else{
      const model={
        hasDatabaseError: false,
        theError: "",
        gallery: theGallery,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      }
      res.render("partials/gallery", model)
    }
  })
});

//---------------
// MIDDLEWARES
//---------------

app.use(express.static('public'))

app.use((req, res, next) => {
  console.log('Middleware called');
  next();
});

//---------------
// POST Forms
//---------------
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

//check the login and password of a user
app.post('/login', (req, res) => {
  const un = req.body.un
  const pw = req.body.pw

  db.get("SELECT * FROM users WHERE uname = ?", [un], function (error, oneUser) {
    if (error) {
      console.log(error);
      res.redirect('/login');
    } else if (oneUser) {
      const hashedPasswordFromDB = oneUser.password;
      //console.log("pw:" + pw)
      //console.log("hash:" + oneUser.password)
      bcrypt.compare(pw, hashedPasswordFromDB, function(err, result) {
        if (err) {
          console.log(err)
          res.redirect('/login')
        } else if (result == true) {
          req.session.isAdmin = (oneUser.uname === "Kimberly")
          req.session.isLoggedIn = true
          req.session.name = oneUser.uname
          console.log(`${oneUser.uname} is logged in!`)
          res.redirect('/')
        } else {
          console.log("Bad user and/or bad password")
          req.session.isAdmin = false
          req.session.isLoggedIn = false
          req.session.name = ""
          res.redirect('/login')
        }
      });
    } else {
      console.log("No such user found");
      req.session.isAdmin = false;
      req.session.isLoggedIn = false;
      req.session.name = "";
      res.redirect('/login');
    }
  });
}); 

//login route
app.get('/login', (req, res) => {
  const model={
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin
  }
  res.render('login', model);
});

//deletes a project
app.get('/projects/delete/:pid', (req, res) => {
  const id = req.params.pid
  if (req.session.isLoggedIn==true && req.session.isAdmin==true){
    db.run("DELETE FROM projects WHERE pid=?", [id], function(error, theProjects) {
      if (error) {
        const model = { 
          dbError: true, 
          theError: error,
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
        }
        console.log("ERROR: ", error)
        res.render("partials/home", model)
      }else{
        const model = { 
          dbError: false, 
          theError: "",
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
        }
        console.log("---> Project deleted.")
        res.render("partials/home", model)
      }
      })
  }else{
    res.redirect('/login')
  }
});

//sends the form for a new project
app.get('/projects/new', (req, res) => {
  if(req.session.isLoggedIn==true && req.session.isAdmin==true) {
    const model = {
      isLoggedIn: req.session.isLoggedIn,
      name: req.session.name,
      isAdmin: req.session.isAdmin, 
    }
    res.render('partials/newproject', model)
  }else{
  res.redirect("/login")
  }
});

//creates a new project
app.post('/projects/new', (req, res) => {
  const newp = [
    req.body.pid, req.body.projname, req.body.projyear, req.body.projdesc, req.body.projtype, req.body.projimg, req.body.videoLink
  ]
  if (req.session.isLoggedIn==true && req.session.isAdmin==true) {
    db.run("INSERT INTO projects (pid, pname, pyear, pdesc, ptype, pimgURL, videoLink) VALUES (?,?,?,?,?,?,?)", newp, (error) => {
      if (error) {
        console.log("ERROR: ", error)
      }else{
        console.log("Line added into the projects table!")
      }
      res.redirect('/projects')
    })
  }else{
    res.redirect('/login')
  }
});
  
//sends the form to modify a project
app.get('/projects/update/:pid', (req, res) => {
  const id = req.params.pid
  db.get("SELECT * FROM projects WHERE pid=?", [id], function (error, theProjects) {
    if(error){
      console.log("ERROR: ", error)
      const model = { 
        dbError: true, 
        theError: error,
        project: {},
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin, 
      }
      //renders the page with the model
      res.render('partials/modifyproject', model)
    }else{
      const model = { 
        dbError: false, 
        theError: "",
        project: theProjects,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
        helpers: {
          theTypeS(value) { return value == "Short film"; },
          theTypeT(value) { return value == "Trailer"; },
          theTypeA(value) { return value == "Assignment"; },
        }
      }
      res.render("partials/modifyproject", model)
    }
  })
});

// modifies an existing project, to update the table
app.post('/projects/update/:pid', (req, res) => {
  const id = req.params.pid //gets the id from a dynamic parameter in the route
  const newp = [
    req.body.projname, req.body.projyear, req.body.projdesc, req.body.projtype, req.body.projimg, id
  ]
  if (req.session.isLoggedIn==true && req.session.isAdmin==true) {
    db.run("UPDATE projects SET pname=?, pyear=?, pdesc=?, ptype=?, pimgURL=?, videoLink=? WHERE pid=?", newp, (error) => {
      if(error) {
        console.log("ERROR: ", error)
      }else{
        console.log("Project updatet!")
      }
      res.redirect('/projects')
    })
  }else{
    res.redirect('/login')
  }
});

//define the /logout route
app.get('/logout', (req, res) => {
  req.session.destroy( (err) => {
    console.log("Error while destroying the session: ", err)
  })
  console.log('Logged out...')
  res.redirect('/')
});



/*
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
  
    try {
      const tokenData = jwt.verify(token, 'YOUR_SECRET_KEY');
      next();
    } catch (err) {
      res.status(401).send({ error: 'Invalid token' });
    }
};

app.get('/api/secret', verifyToken, (req, res) => {
    res.send({ message: 'You are logged in' });
});
  
app.post('/api/auth', (req, res) => {
  const {username, password} = req.body;
  // Verify username and password here
  const payload = { username };
  var token = jwt.sign(payload, 'YOUR_SECRET_KEY');
  res.send({ token });
});

app.get('/api/secret', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  
  try {
    const tokenData = jwt.verify(token, 'YOUR_SECRET_KEY');
    res.send({ message: 'You are logged in' });
  } catch (err) {
    res.status(401).send({ error: 'Invalid token' });
  }
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');
  db.run('INSERT INTO users (name, age) VALUES (?, ?)', ['John', 25]);
  db.run('INSERT INTO users (name, age) VALUES (?, ?)', ['Alice', 30]);
  db.each('SELECT * FROM users', (err, row) => {
    console.log(row);
  });
});
db.close();

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("views"));

app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.send(`Hello ${req.session.name}`);
});

app.get('/setname', (req, res) => {
  req.session.name = req.query.name;
  res.send('Session started');
});

app.get('/', (req,res) => {
  res.render('index', { user: req.session?.user });
});  

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
  res.redirect('/login');
  }
};
  
app.get('/secret', isAuthenticated, (req, res) => {
  res.render('secret');
});

app.get('/secret', (req, res) => {
  if (req.session.user) {
    res.render('secret', { user: req.session.user });
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
  res.send('Session destroyed');
});
  
app.get('/api/users', (req, res) => {
  const id = req.params.id;
  const name = req.query.name;
  const age = req.query.age;
  res.status(200).json(user);
});

app.get('/api/users/:id', (req, res) => {
  // Get user with id req.params.id
  const id = req.params.id;
  const name = req.query.name;
  const age = req.query.age;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else if (row) {
      res.status(200).json(row);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });    
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('index', { user: req.session.user });
  } else {
    res.render('index');
  }
});  

app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('index', { user: req.session.user });
  } else {
    res.render('index');
  }
});
  
app.get('/', function(req, res){
    res.sendFile(__dirname + "/" + '/views/layouts/home');
  });

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Requires a sqlite3 database
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      res.status(500).send({ error: 'Server error' });
    } else if (!user) {
      res.status(401).send({ error: 'User not found' });
    } else {
      const result = bcrypt.compareSync(password, user.hash);
      
      if (result) {
        req.session.user = user;
        res.redirect('/');
      } else {
        res.status(401).send({ error: 'Wrong password' });
      }
    }
  });
});  

app.post('/api/users', (req, res) => {
  // Create a new user
  const name = req.body.name;
  const age = req.body.age;
  app.use(express.urlencoded( { extendend: false}));
  app.get('/register', (req, res)=> {
    res.render('register');
  })
  // Create a new user
  db.run('INSERT INTO users (name, age) VALUES (?, ?)', [name, age], (err) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      res.redirect('/login');
      res.status(201).json({ message: 'User created' });
    }
  });    
});

app.put('/api/users/:id', (req, res) => {
  // Update user with id req.params.id
  const id = req.params.id;
  const name = req.body.name;
  const age = req.body.age;
  db.run('UPDATE users SET name = ?, age = ? WHERE id = ?', [name, age, id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      res.status(200).json({ message: 'User updated' });
    }
  });
});

app.delete('/api/users/:id', (req, res) => {
  // Delete user with id req.params.id
  const id = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      res.status(200).json({ message: 'User deleted' });
    }
  });
});
*/

app.listen(port, () => {
    console.log(`Express server is running and listening on port ${port}`);
})
