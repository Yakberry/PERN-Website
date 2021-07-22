require('dotenv').config()
const { Console } = require("console")
const express = require("express")
const sequelize = require('./db')
const models = require('./models/models')
const path = require('path')
const ApiError = require('./error/ApiError')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const cors = require('cors');
const { Op } = require ("sequelize")
const { utimes } = require('fs')


const PORT = process.env.PORT || 3001;

const app = express();

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(
  express.json()
)
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());
app.use(morgan('dev'));
app.use(fileupload())

let counter = 0;
let doc_path = "resources/try.docx";
let sopid;
let versid;

app.get("/works", (req, res) => {
    counter++; 
    res.json({ message: `Worked ${counter} times!`});
})

const convert = async (path) => {
  var mammoth = require("mammoth");
  const result = await mammoth.convertToHtml({path})
  var html = result.value; // The generated HTML
  return html
}

app.post("/tohtml", async (req, res) => {


  const {sopId} = req.body
  const sop = await models.Sop.findOne({where:{id: sopId}})
  const sopPath = sop.link
  const html = await convert(sopPath)
  res.json({message1: html})

})

app.post("/tohtml-version", async (req, res) => {


  const {versId} = req.body
  const version = await models.Version.findOne({where:{id: versId}})
  const versPath = version.link
  const html = await convert(versPath)
  res.json({message1: html})

})


app.get("/users", async (req, res) => {
  const userdata = await models.User.findAll({raw:true});
  res.json(userdata);
})


app.post("/sops", async (req, res) => {
  const {searchTarget} = req.body
  console.log(searchTarget)
  console.log(searchTarget === true)
  if (searchTarget)
  {
    const sopdata = await models.Sop.findAll({where:{tags: {[Op.like]: '%' + searchTarget + '%'}}, raw:true})
    res.json(sopdata);
  }
  else 
  {
    const sopdata = await models.Sop.findAll({raw:true});
    res.json(sopdata);
  }
})

app.post("/versions", async (req, res) => {

    console.log('versions')
    const versiondata = await models.Version.findAll({raw:true});
    console.log('versions got')
    res.json(versiondata);
})


app.post("/registration", async (req, res, next) => {
  console.log(req.body, res.body);
  const {login, password} = req.body
  console.log(login, password, "----DATA!!!!!");
        if (!login || !password) {
            return res.status(401).json('Incorrect login or password')
        }
        const repeated_login = await models.User.findOne({where: {login}})
        if (repeated_login) {
            return res.status(400).json('Login is occupied')
        }
        const token = uuidv4();
        const rating = 1
        await models.User.create({login, password, token, rating})
        return res.json({
          token: token,
          login: login
        })
})

app.post("/login", async (req, res, next) => {
  const {login, password, token} = req.body
  let result = true
  let send_token
  if (token) {
    const user = await models.User.findOne({where:{token}})
    if (!user){
      result = false
      return next(ApiError.internal('Пользователь не найден'))
    }
    send_token = user.token
    send_login = user.login
    return res.json({
      token: send_token,
      login: send_login,
      success: result
    })
  }
  else {
    const user = await models.User.findOne({where: {login}})
    if (!user) {
      result = false
      return res.status(401).json('User not found!')
    }
    let comparePassword = password == user.password
    if (!comparePassword) {
        result = false
        return res.status(400).json('Wrong password!')
    }
    send_token = user.token
    send_login = user.login
    return res.json({
      token: send_token,
      login: send_login,
      success: result
    })
    }
})

app.post('/upload-doc', async (req, res) => {
  const {file} = req.body
  const {doc} = file
  console.log(file + '--- file in upload');
  console.log(doc + '--- doc in upload');
  let filename = file + ".jpg"
  //file.mv(path.resolve(__dirname, 'uploads', filename))
  file.mv('./uploads/' + filename, function (err) {
    if (err) {
      res.send(err)
    }
    else {
      res.send("File Uploaded!")
    }
  })

  //send response
  res.send({
      status: true,
      message: 'File is uploaded',
      data: {
          name: doc.name,
          mimetype: doc.mimetype,
          size: doc.size
      }
  });
});

app.post('/upload-file', async (req, res) => {
  if (req.files)
  {
    console.log(req.files + '<- files')
    var file = req.files.file2
    var filename = file.name
    console.log(filename + '<- filename')
    
    file.mv('./uploads/' + filename, async function (err) {
      if (err) {
        res.send(err)
      }
      else {
        let rating = 0
        let rated_users = []
        let pathfile = `uploads/${filename}`
       
        console.log(pathfile)
        const html = await convert(pathfile)

        const sop = await models.Sop.create({title: filename, link: pathfile, html: html, rating: rating, rated_users: rated_users})
        sopid = sop.id
        console.log(sopid + ' ' + sop.id + '<- sopid')
        res.status(200).json('file uploaded')
      }
    })
  }


})

app.post('/upload-file-author', async (req, res) => {
  const {login, tags} = req.body
  console.log(login + ' ' + tags + '<- LOGIN AND TAGS!!!!')
  
  console.log(sopid + '<- sopid in AUTHOR')
    const user = await models.User.findOne({where:{login: login}})
    userid = user.id
    const sop = await models.Sop.findOne({where:{id: sopid}})
    sop.userId = userid
    sop.author = login
    sop.rated_users = [userid]
    sop.tags = tags
    sopid = false
    await sop.save()
    console.log('author set to: ' + user.login)
    res.status(200).json('file author set')
})


app.post('/upload-version', async (req, res) => {
  if (req.files)
  {
    console.log(req.files + '<- files')
    var file = req.files.file2
    var filename = file.name
    console.log(filename + '<- filename')
    
    file.mv('./uploads/' + filename, async function (err) {
      if (err) {
        res.send(err)
      }
      else {
        let rating = 0
        let rated_users = []
        let pathfile = `uploads/${filename}`
        console.log(pathfile)
        const html = await convert(pathfile)

        const vers = await models.Version.create({link: pathfile, html: html, rating: rating, rated_users: rated_users})
        versid = vers.id
        console.log(versid + ' ' + vers.id + '<- versid')
        console.log('All good, version uploaded')
        res.status(200).json('file uploaded')
      }
    })
  }


})

app.post('/upload-version-author', async (req, res) => {
  const {login, tags, thissopid} = req.body
  console.log(login + ' ' + tags + '<- LOGIN AND TAGS!!!!')
  
  console.log(versid + '<- versid in AUTHOR')
    const user = await models.User.findOne({where:{login: login}})
    userid = user.id
    const verse = await models.Version.findOne({where:{id:versid}})
    const versions = await models.Version.findAll({where:{sopId:thissopid}})
    let count = versions.filter(item => item.sopId === thissopid).length + 1
    console.log (count + ' <- count!')
    verse.userId = userid
    verse.number = count
    verse.sopId = thissopid
    verse.author = login
    verse.annotation = tags
    verse.rated_users = [userid]
    versid = false
    await verse.save()
    console.log('author set to: ' + user.login)
    res.status(200).json('version author set')
})

app.post('/vote', async (req, res) => {
    const {userLogin, sopId, versId} = req.body
    console.log(versId + ' VersId!')
    const user = await models.User.findOne({where:{login:userLogin}})
    const sop = await models.Sop.findOne({where:{id: sopId}})
    let version
    if (versId) {version = await models.Version.findOne({where:{id: versId}})}
    
    if (versId && version.sopId == sop.id)
    {
      const user_author = await models.User.findOne({where:{login: version.author}})
      console.log('VERSION VOTE')
      let rated = version.rated_users
      console.log(rated + '<- rated')
      let found = false
      found = rated.includes(user.id)
      rated = rated + ',' + user.id
      var newrated = rated.split(',').map(function(item) {
        return parseInt(item, 10);
      });
      
      if (!found && version.author != userLogin)
      {
        const prevrating = version.rating
        version.rating = version.rating + user.rating
        version.rated_users = newrated
        await version.save()
        user_author.rating = user_author.rating + user.rating * 0.5
        await user_author.save()
        res.status(200).json('vote success')
      }
      else 
      {
        res.status(400).json('vote failure')
      }
    }
    else 
    {
      const user_author = await models.User.findOne({where:{login: sop.author}})
      let rated = sop.rated_users
      console.log(rated + '<- rated')
      let found = false
      found = rated.includes(user.id)
      rated = rated + ',' + user.id
      var newrated = rated.split(',').map(function(item) {
        return parseInt(item, 10);
      });
      
      if (!found && sop.author != userLogin)
      {
        const prevrating = sop.rating
        sop.rating = sop.rating + user.rating
        sop.rated_users = newrated
        await sop.save()
        user_author.rating = user_author.rating + user.rating * 0.5
        user_author.save()
        res.status(200).json('vote success')
      }
      else 
      {
        res.status(400).json('vote failure')
      }
    }

    
})

app.post('/delete', async (req, res) => {
  const {userLogin, sopId} = req.body
  const user = await models.User.findOne({where:{login: userLogin}})
  const sop = await models.Sop.findOne({where:{id: sopId}})

  if (sop.author == userLogin)
  {
    await sop.destroy()
    res.status(200).json('vote success')
  }
  else 
  {
    res.status(400).json('delete failure')
  }
})

app.post('/download', async (req, res) => {
  const {sopId} = req.body
  const sop = await models.Sop.findOne({where:{id: sopId}})
  const filepath = '/' + sop.link
  console.log(filepath + '<- LINK')
  const file = `${__dirname}${filepath}`;
  const filename = sop.title
  console.log(file + ' ' + filename)
  res.download(file, filename); // Set disposition and send it.
  //res.status(200).json('download success -> ' + sop.title)
  
})



const start = async () => {
  try {
      await sequelize.authenticate()
      await sequelize.sync()
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (e) {
      console.log(e)
  }
}


start()