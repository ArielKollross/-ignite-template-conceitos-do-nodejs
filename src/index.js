const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  if(!username)
    return response.status(400).json({ error: "username is required"})

  const getUserByUsername = users.find(user => user.username === username)

  if(!getUserByUsername)
    return response.status(400).json({ error: "username not found"})

  request.user = getUserByUsername

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if(!name || !username)
    return response.status(400).json({ error: "Name/username is required" })

  const checkExistUserName = users.find(user => user.username === username)

  if(checkExistUserName)
    return response.status(400).json({ error: "Username is already booked" })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user)

  return response.status(201).json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  if(!title || !deadline)
    return response.status(400).json({ error: "Title/deadline is required"})
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  if(!id)
    return response.status(400).json({ error: "Todo id is required"})

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0)
    return response.status(404).json({ error: "Todo not found"})

  if(title)
    user.todos[todoIndex].title = title

  if(deadline)
    user.todos[todoIndex].deadline = new Date(deadline)

  return response.status(200).json(user.todos[todoIndex])
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0)
    return response.status(404).json({ error: "Todo not found"})
  
  user.todos[todoIndex].done = !user.todos[todoIndex].done

  return response.status(200).json(user.todos[todoIndex])
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  if(!id)
    return response.status(400).json({ error: "Id is required"})

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0)
    return response.status(404).json({ error: "todo not found" })

  user.todos.splice(todoIndex, 1)

  return response.status(204).send()
})

module.exports = app