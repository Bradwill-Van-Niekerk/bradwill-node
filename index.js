// const http = require("http");
// const hostName = "127.0.0.25";
// const express = require("express");
// const app = express();

// var fs = require("fs");

// app.use(express.json());

// // Port where the server will listen
// const port = 3000;

// // Sample in-memory data (you can replace this with a database later)
// let items = [];

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://${hostName}:${port}/`);
// });

// //calling file to read, write and edit
// var fs = require('fs');
// http.createServer(function (req, res) {
//   fs.readFile('index.html', function(err, data) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     return res.end();
//   });
// }).listen(8080);

// // CREATE: Add a new item
// app.post('/items', (req, res) => {
//     const newItem = {
//       id: items.length + 1, // simple unique ID
//       name: req.body.name,
//     };

//     items.push(newItem);
//     res.status(201).json(newItem);
//   });

//   // READ: Get all items
//   app.get('/items', (req, res) => {
//     res.json(items);
//   });

//   // READ: Get a specific item by ID
//   app.get('/items/:id', (req, res) => {
//     const id = parseInt(req.params.id);
//     const item = items.find((i) => i.id === id);

//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     res.json(item);
//   });

//   // UPDATE: Update an item by ID
//   app.put('/items/:id', (req, res) => {
//     const id = parseInt(req.params.id);
//     const itemIndex = items.findIndex((i) => i.id === id);

//     if (itemIndex === -1) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     // Update the item
//     items[itemIndex].name = req.body.name;
//     res.json(items[itemIndex]);
//   });

//   // DELETE: Remove an item by ID
//   app.delete('/items/:id', (req, res) => {
//     const id = parseInt(req.params.id);
//     const itemIndex = items.findIndex((i) => i.id === id);

//     if (itemIndex === -1) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     // Remove the item
//     const deletedItem = items.splice(itemIndex, 1);
//     res.json(deletedItem[0]);
//   });

const http = require("http");
const fs = require("fs");
const url = require("url");
const hostName = "127.0.0.1";

// In-memory data store
const fileData = fs.readFileSync("items.json");
let items = JSON.parse(fileData);

let other = items.length // counts the amount of ID's in the json file
let nextId = other + 1 // To generate unique IDs for items


// Create the server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Serve index.html for the root URL && to get data from json file
  if (parsedUrl.pathname === "/items" && req.method === "GET") {
    fs.readFile("items.json", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(data);
    });
    return;
  }
  
  // used to post new data 
  if (parsedUrl.pathname === "/items") {
    switch (req.method) {
     case "POST":
        // Create a new item
        let body = "";
        req.on("data", chunk => {
        body += chunk.toString(); // Convert Buffer to string
        });
        req.on("end", () => {
          const newItem = JSON.parse(body);
          newItem.id = nextId++;
          items.push(newItem)
          fs.writeFileSync("items.json", JSON.stringify(items),null,2);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(newItem));
        });
        break;
      
      default:
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed");
    };
    //used for selecting specific ID's
  } else if (parsedUrl.pathname.startsWith("/items/")) {
    const id = parseInt(parsedUrl.pathname.split("/")[2]);
    const itemIndex = items.findIndex(item => item.id === id);

    switch (req.method) {
      case "GET":
        // Read a specific item by ID
        if (itemIndex !== -1) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(items[itemIndex]));
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Item not found");
        }
        break;

      case "PUT":
        // Update an existing item by ID
        let updateBody = "";
        req.on("data", chunk => {
          updateBody += chunk.toString();
        });
        req.on("end", () => {
          if (itemIndex !== -1) {
            const updatedItem = JSON.parse(updateBody);
            //checks items index displays accordingly
            if (items[itemIndex].name === updatedItem.name || updatedItem.name === "" || updatedItem.name == null){
            items[itemIndex].name;
          }else {
            items[itemIndex].name = updatedItem.name;
          }
          if (items[itemIndex].surname === updatedItem.surname || updatedItem.surname === "" || updatedItem.surname == null){
            items[itemIndex].surname;
          }else {
            items[itemIndex].surname = updatedItem.surname;
          }
          if (items[itemIndex].age === updatedItem.age || updatedItem.age == null){
            items[itemIndex].age;
          }else {
            items[itemIndex].age = updatedItem.age;
          }
            // items.push(updatedItem)
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(items[itemIndex]));
            fs.writeFileSync("items.json", JSON.stringify(items));
          } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Item not found");
          }
        });
        break;

      case "DELETE":
        // Delete an item by ID
        if (itemIndex !== -1) {
          const deletedItem = items.splice(itemIndex, 1);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(deletedItem));
          fs.writeFileSync("items.json", JSON.stringify(items));
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Item not found");
        }
        break;

      default:
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed");
    }
  } else {
    // Handle 404 Not Found
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, hostName, () => {
  console.log(`Server is running on http://${hostName}:${PORT}/items`);
});
