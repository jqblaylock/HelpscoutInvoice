Run "Start Server.bat" to bring the server up. Then access the app at localhost:3000.


The following are the common db settings used for this api.  The Local Host is for Jacob's machine, and will have to be updated
if it is pointed to a different local MYSQL db.

Copy these settings into the "server.config.json" and restart the server for these to take effect.  Do not include the
comments as they are invalid in the JSON and will cause the server to crash on start up.

    // Local Host
    "connectionLimit" : 10,
    "host": "localhost",
    "user": "root",
    "password": "PMT@mysql1",
    "database": "helpscoutapi"

    // Blue Host

    "connectionLimit" : 5,
    "host": "box867.bluehost.com",
    "user": "temporc7_tech",
    "password": "1YeVF56r9aUg0QCLGdmF",
    "database": "temporc7_tech"
