# Overview

The workshop covered angular routing and the creation of the first service.

- Routing: using HTML5 mode (history.pushState)
- First custom service: TransactionStore - communicates with a REST API to retrieve/create/delete transactions for a Budget Application

## Launch a development server

The server offers the same file (index.html) no matter what the URL is in case the file does not exist. This allows for the implementation of the HTML5 mode routing in Angular.js.

Launch a new instance of the server:

```Shell
npm install
npm start
```

Then just access localhost:8080 in a browser to see the code running.
