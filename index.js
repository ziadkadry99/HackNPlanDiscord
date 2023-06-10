const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
axios.defaults.headers.post['Content-Type'] = 'application/json'

const PORT = process.env.PORT;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const HACKNPLAN_BASE_URL = 'https://api.hacknplan.com/v0'
const HACKNPLAN_API_KEY = process.env.HACKNPLAN_API_KEY
const MAIN_PROJECT_ID = '179190'

app.post('/', async (req, res) => {
  eventType = req.headers['x-hacknplan-event'] 
  body = req.body
  switch(eventType) {
    case 'workitem.user.assigned': 
      break
    case 'workitem.user.unassigned':
      break
    case 'workitem.comment.created':
      const username = await GetUsername(body['ProjectId'], body['User']['Id'])
      const workItemTitle = await GetWorkItemTitle(body['ProjectId'], body['WorkItemId'])
      discordMessageBody = JSON.stringify(CreateMessage(`#${body['WorkItemId']} ${workItemTitle}`, 'Comment Added', body['Text'], username))
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
  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

async function GetUsername(projectId, userId) {
  const config = {
    headers: {
      Authorization: `ApiKey ${HACKNPLAN_API_KEY}`
    }
  }
  let username = 'Unknown'
  await axios.get(`${HACKNPLAN_BASE_URL}/projects/${projectId}/users`, config).then(res => {
    
    res.data.forEach(user => {
     if(user['user']['id'] == userId) {
      username = user['user']['username']
     } 
    });
  })

  return username
}

async function GetWorkItemTitle(projectId, workItemId) {
  const config = {
    headers: {
      Authorization: `ApiKey ${HACKNPLAN_API_KEY}`
    }
  }
  let workItemTitle = 'Unknown'
  await axios.get(`${HACKNPLAN_BASE_URL}/projects/${projectId}/workitems/${workItemId}`, config).then(res => {
    workItemTitle = res.data['title']
  })

  return workItemTitle
}

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
          "icon_url": "https://hacknplan.com/wp-content/uploads/2016/05/icon_web.png"
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