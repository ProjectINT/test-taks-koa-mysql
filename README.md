## Test task koa + MySQL without ORM

### Features

 ##### 1. App create table with 1e3 items with fields: (if not exist)
    - bookId (number from 0 to items count)
    - title
    - date
    - autor
    - description
    - image
##### 2 Have api endpoints:

##### GET
     '/api/books:bookId?'
    Avaible get params:
        title: string,
        author: string,
        minDate: valid date,
        maxDate: valid date,
        limit: number,
        offset: number,
        order: date || author,
	* valid date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#Date_Time_String_Format,

##### POST
    - '/api/add-book'
Add book route expect to receive object with all book fields. bookId will addet automaticly and send database response.
    
    - '/api/update-book'
Update book route expect to receive object with bookId as WHERE condition and send database response.

#### INSTALLATION
    Clone repository.
	Run "npm install"
    Run "npm run build" to remove flow types
	Fill config in "/config.js" or use ".env" variables from this file.
	Run "npm run dev" it will run app from build folder.
App will create db in first run and show info about success.

Like emoji? Look there: https://gitmoji.carloscuesta.me/