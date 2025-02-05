// Create web server
// Load modules
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var _ = require('underscore');
var app = express();

// Load comments from file
var comments = [];
fs.readFile('comments.json', function(err, data) {
  if (err) {
    console.error(err);
  } else {
    comments = JSON.parse(data);
  }
});

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Routes
app.get('/comments', function(req, res) {
  res.json(comments);
});

app.post('/comments', function(req, res) {
  var comment = req.body;
  comment.id = comments.length + 1;
  comments.push(comment);
  fs.writeFile('comments.json', JSON.stringify(comments), function(err) {
    if (err) {
      console.error(err);
      res.status(500).end();
    } else {
      res.status(201).json(comment);
    }
  });
});

app.delete('/comments/:id', function(req, res) {
  var id = parseInt(req.params.id);
  var comment = _.findWhere(comments, {id: id});
  if (comment) {
    comments = _.without(comments, comment);
    fs.writeFile('comments.json', JSON.stringify(comments), function(err) {
      if (err) {
        console.error(err);
        res.status(500).end();
      } else {
        res.status(204).end();
      }
    });
  } else {
    res.status(404).end();
  }
});

// Start server
var server = app.listen(3000, function() {
  console.log('Server listening on port 3000');
});

// Graceful shutdown
process.on('SIGINT', function() {
  console.log('Shutting down server');
  server.close(function() {
    console.log('Server stopped');
    process.exit();
  });
});