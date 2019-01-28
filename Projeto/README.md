# myFacebook

To run this applications, please follow theses steps:

1. In the `src` folder, run `npm install` to install all packages needed for the application to work.

2. The application needs a MongoDB database. As such, it is possible to use the database provided in the `data` folder, or create a new one. 
    * If the port in which MongoDB is not `21017`, please change the connection URI in the `src\config.js` file.

3. It is now possible to run the application, with the command `npm start` while in the folder `src`.
    * It is possible to change the port in which the application listens for requests in the `src\config.js` file.