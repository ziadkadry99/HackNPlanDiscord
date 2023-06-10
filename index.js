const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
axios.defaults.headers.post['Content-Type'] = 'application/json'

const PORT = process.env.PORT;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

app.post('/', async (req, res) => {
  eventType = req.headers['x-hacknplan-event'] 
  console.log(req.body)
  body = req.body
  switch(eventType) {
    case 'workitem.user.assigned': 
      break
    case 'workitem.user.unassigned':
      break
    case 'workitem.comment.created':
      discordMessageBody = JSON.stringify(CreateMessage(`#${body['WorkItemId']}`, 'Comment Added', body['Text'], body['User']['Id']))
      console.log('DISCORD MESSAGE BODY: ' + discordMessageBody)
      await axios.post(DISCORD_WEBHOOK_URL, discordMessageBody)
      .then(function (response) {
        console.log('DISCORD RESPONSE: ' + response)
        res.send('')
      })
      .catch(function (error) {
        console.log('ERROR: ' + error)
        res.send('')
      });
      break
  }
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

function CreateMessage(taskTitle, change, value, user) {
  return {
    "username": "HackNPlan Bot",
    "avatar_url": "https://hacknplan.com/wp-content/uploads/2016/05/icon_web.png",
    "content": "",
    "embeds": [
      {
        "author": {
          "name": "HackNPlan Bot",
          "url": "https://app.hacknplan.com/p/179190",
          "icon_url": "https://i.imgur.com/R66g1Pe.jpg"
        },
        "title": "Test",
        "url": "https://app.hacknplan.com/p/179190",
        "description": "",
        "color": 15258703,
        "fields": [
          {
            "name": "Task Title",
            "value": taskTitle,
            "inline": true
          },
          {
            "name": "Change",
            "value": change,
            "inline": true
          },
          {
            "name": "User",
            "value": user
          },
          {
            "name": "Value",
            "value": value
          }
        ]
      }
    ]
  }
}