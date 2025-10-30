Cache Me If You Can Group Project:

.env file

- In the server directory create a .env file with these fields and values
  specific to your local machine

  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASS={REPLACE_ME}
  DB_NAME=cache_me_if_you_can_db
  PORT=5050
  ```

- In the client directory create .env file with these fields and google maps api key

```
REACT_APP_GOOGLE_MAPS_API_KEY={REPLACE ME}
```

Server

- You can start the backend by running node index.js in the server directory

Client

- You can start the frontend by running npm start in the client directory
