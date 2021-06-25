// express를 사용하여 서버를 생성
const express = require('express')
const app = express()
const port = 5000

// mongoose를 사용하여 mongoDB 연결
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://koChic:aleldj12!@@boiler-plate.jm4ft.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))