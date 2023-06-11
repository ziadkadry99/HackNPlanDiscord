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

  const username = await GetUsername(body['ProjectId'], body['User']['Id'])
  switch(eventType) {
    case 'workitem.user.assigned': 
      break
    case 'workitem.user.unassigned':
      break

    case 'workitem.updated':
      let assignedUsernames = ''
      await Promise.all(body['AssignedUsers'].map(async (user) => {
        assignedUsernames += await GetUsername(user['ProjectId'], user['User']['Id']) + ' '
      }))
      let stage = 'Unknown'
      let color = 15258703
      switch (body['Stage']['StageId']) {
        case 1:
          stage = 'Planned 🗓️'
          color = 9807270
          break
        case 2:
          stage = 'In Progress 🧑‍💻'
          color = 3447003
          break
        case 3:
          stage = 'Testing 🕹️'
          color = 15548997
          break
        case 4:
          stage = 'Completed🥳'
          color = 5763719
          break
      }
      const messageText = `Task moved to stage: ${stage}`
      discordMessageBody = JSON.stringify(CreateMessage(body['projectId'], body['Board']['BoardId'], body['WorkItemId'], `${body['Title']}`, `Task ${stage}`, messageText, assignedUsernames, color))
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
    case 'workitem.comment.created':
      const workItemTitle = await GetWorkItemTitle(body['ProjectId'], body['WorkItemId'])
      const firstBoardId = await GetFirstBoard(body['ProjectId'])
      discordMessageBody = JSON.stringify(CreateMessage(body['ProjectId'], firstBoardId, body['WorkItemId'], `${workItemTitle}`, 'Comment Added', body['Text'], username, 15258703))
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

function GetImageFromText(text) { 
  regex = 'https?:/(/[^/]+)+\.(?:jpg|gif|png)'
  const images = [...text.matchAll(regex)]
  return images.length > 0 ? images[0][0] : ''
}

async function GetFirstBoard() {
  const config = {
    headers: {
      Authorization: `ApiKey ${HACKNPLAN_API_KEY}`
    }
  }
  let boardId = 'Unknown'
  await axios.get(`${HACKNPLAN_BASE_URL}/projects/${projectId}/boards`, config).then(res => {
    boardId = res.data[0]['boardId']
  })

  return boardId

}

function CreateMessage(projectId, boardId, taskId, taskTitle, change, value, user, color) {
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
        "title": `#${taskId}`,
        "url": `https://app.hacknplan.com/p/${projectId}/kanban?userId=0&boardId=${boardId}&taskId=${taskId}&tabId=basicinfo`,
        "description": "",
        "color": color,
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
            "name": "Notification",
            "value": value
          }
        ],
        "image": {
          "url": GetImageFromText(value)
        }
      }
    ]
  }
}