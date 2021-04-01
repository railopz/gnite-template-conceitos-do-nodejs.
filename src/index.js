const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'Username not exists!' })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const findUsernameExists = users.find((user) => user.username === username);

  if (findUsernameExists) {
    return response.status(400).json({ error: 'Username already exists!' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.json(user).status(201);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;


  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  todo.done = true;

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  user.todos.splice(todo, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;