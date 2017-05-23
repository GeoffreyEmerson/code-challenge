# Code Challenge

Author: Geoffrey Emerson  
Date: May 16th - 22nd, 2017

## Prerequisites

* [node.js](https://nodejs.org/en/)

## Installation

This app was built and tested on OSX.

1. Clone this repo to your local drive, then navigate into the directory.
1. Run `npm install` to set up packages.
1. Tests can be run with `npm test`.
1. Run `npm start` to start the demo with a Mockgoose database with dummy data.
1. Or run `npm live` to run against a local mongo database with no data added.

## Notes

Access to the API is only open to authorized user accounts.

The demo provides an example user to sign with, or you can create your own user.

### Login:

POST to 'localhost:3000/api/auth/login' with a JSON object that includes email and password.  Here is the pre-loaded user:

```
{
  "email": "sally@ccas.site",
  "password": "CorrectHorseBatteryStaple"
}
```
Curl example:
```
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email": "sally@ccas.site","password": "CorrectHorseBatteryStaple"}' 
```

This will return a token string that is required to access other routes. A fresh token is required. The tokens provided in examples will need to be replaced by a new token.

### Signup:

POST to 'localhost:3000/api/auth/signup' with a JSON object that includes a username, email, password, and confirmation. Example:

```
{
  "username": "Bob",
  "email": "bob@ccas.site",
  "password": "password1234",
  "confirmation": "password1234"
}
```

```
curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"username": "Bob","email": "bob@ccas.site","password": "password1234","confirmation": "password1234"}'
```

Note that after signing up as a new user, you will still have to log in. Potentially, there would be an added step of getting your account approved by a system administrator, but for this demo the approval is automatic.

### Customers:

GET to 'localhost:3000/api/customers' with a valid token in the header will return a list of current customers in the database.

```
curl http://localhost:3000/api/customers -H "token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MjNhM2Q0MjljOTUxMjhiOTk2Njc2NCIsInVzZXJuYW1lIjoiU2FsbHkiLCJlbWFpbCI6InNhbGx5QGNjYXMuc2l0ZSIsImlhdCI6MTQ5NTUwNzk0OH0.xeQOrj-YrsWoLYv9QR2934aRNrmirzDw0GnmbWse-pw"
```

### Creating a customer:

POST to 'localhost:3000/api/customers' with a valid token and customers object that includes name, address, city, state, zip, and country. Example:

```
{
  "name": "Larry", 
  "address": "1234 Any St.", 
  "city": "Eugene", 
  "state": "OR", 
  "zip": "97401", 
  "country": "USA"
}
```

```
curl -X POST http://localhost:3000/api/customers -H "Content-Type: application/json" -d '{"name": "Larry", "address": "1234 Any St.", "city": "Eugene", "state": "OR", "zip": "97401", "country": "USA"}' -H "token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MjNhM2Q0MjljOTUxMjhiOTk2Njc2NCIsInVzZXJuYW1lIjoiU2FsbHkiLCJlbWFpbCI6InNhbGx5QGNjYXMuc2l0ZSIsImlhdCI6MTQ5NTUwODExM30.CxtMJJrDh9ca5v58NAsabDYGi9iuKQsc0fqwGGvj8H0"
```

### Orders:

GET to 'localhost:3000/api/orders' with a valid token in the header will return a list of current orders in the database.

```
curl http://localhost:3000/api/orders -H "token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MjNhM2Q0MjljOTUxMjhiOTk2Njc2NCIsInVzZXJuYW1lIjoiU2FsbHkiLCJlbWFpbCI6InNhbGx5QGNjYXMuc2l0ZSIsImlhdCI6MTQ5NTUwNzk0OH0.xeQOrj-YrsWoLYv9QR2934aRNrmirzDw0GnmbWse-pw"
```

### Creating an order:

POST to 'localhost:3000/api/orders' with a valid token and order object that includes make, model, package, and customer_id. Example:

```
{
  "make": "Honda",
  "model": "Civic",
  "package": "silver",
  "customer_id": "5923a56429c95128b996676e"
}
```

```
curl -X POST http://localhost:3000/api/order -H "Content-Type: application/json" -d '{"make": "Honda","model": "Civic","package": "silver","customer_id": "5923a56429c95128b996676e"}' -H "token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MjNhM2Q0MjljOTUxMjhiOTk2Njc2NCIsInVzZXJuYW1lIjoiU2FsbHkiLCJlbWFpbCI6InNhbGx5QGNjYXMuc2l0ZSIsImlhdCI6MTQ5NTUwODExM30.CxtMJJrDh9ca5v58NAsabDYGi9iuKQsc0fqwGGvj8H0"
```

Make and model are open to any string. Package must be either 'std', 'silver', or 'gold'. The package choice affects the external requests that are created from the local order.

The customer_id must be for an existing customer in the database.

### Healthcheck

This demo also includes a simple healthcheck route that returns {"status": "ok"}.

```
curl localhost:3000/api/healthcheck
```
