# local-server

A simple local server to serve static files such as webpack assets on local file-system, local html/css/javascripts, etc. 

You can also browse directories when using the web server.

Relative paths that resolve outside of the watched directory are not allowed. 



```
node index.js [--folder folder to watch] [-p port] [-h hostname] [--mime] [--help]
```

To get more information, use the `--help`.
