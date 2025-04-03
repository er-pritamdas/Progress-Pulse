## **How I Build the Server**

- To Build any server using nodejs I have start with initializing a new nodejs project
- To Initialize the new nodejs project :
  - `npm init`
- It will create a package.json file, Which will stores the metadata about the project :

  ```json
  {
  "name": "demo",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
  }
  ```
- ### Change the type from "commonjs" to "modulejs"
  - Why ?
- ### "start" key in "scripts":
  - "start" : "nodemon src/index.js"
  - why ?
- Now I have my nodejs project skeleton ready which we will modify on demand of the project for now I will start building my server:
  - I have first install the expressjs which I will be using to build my server:
    - `npm install express`
  - Whenever you install anything using npm you can see the version in the dependencies:
    - ```json
        "dependencies": {
          "dotenv": "^16.4.7",
          "express": "^4.21.2",
          "mongoose": "^8.12.1",
          "nodemailer": "^6.10.0",
          "nodemon": "^3.1.9"
        }
      ```
- In this project I have made multiple directories which gives the project a structure
  - In src folder i have kept my index.js file which is the starting point of server 
  - Before runnign the server I have first connect to DB using connectDB() method
  - this function again stored in the db folder 
- After connecting to DB I started my server in the predefined port