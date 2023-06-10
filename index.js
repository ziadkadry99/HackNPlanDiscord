import axios from 'axios';
const express = require('express')

const app = express()
const PORT = 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

app.get('/', (req, res) => {
  eventType = req.headers['x-hacknplan-event']
  body = req.body
  switch(eventType) {
    case 'workitem.user.assigned': 
      break
    case 'workitem.user.unassigned':
      break
    case 'workitem.comment.created':
      axios.post(DISCORD_WEBHOOK_URL, CreateMessage(`#${body[WorkItemId]}`, 'Comment Added', body['Text'], body['User']['Username']))
      .then(function (response) {
        res.send(res)
      })
      .catch(function (error) {
        res.send(res)
      });
      break
  }
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${port}`)
})

function CreateMessage(taskTitle, change, value, user) {
  return {
    username: "HackNPlan Bot",
    avatar_url: "https://hacknplan.com/wp-content/uploads/2016/05/icon_web.png",
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