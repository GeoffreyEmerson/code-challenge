# Code Challenge

Author: Geoffrey Emerson
Date: May 16th, 2017

## Prerequisites

* [node.js](https://nodejs.org/en/)

## Installation

1. Clone this repo to your local drive, then navigate into the directory.
1. Run `npm install` to set up packages.
1. Tests can be run with `npm test`.
1. Run `npm start` to start the demo with a Mockgoose database with dummy data.
1. Or run `npm live` to run against a local mongo database with no data added.

## Notes

Access to the API is only open to authorized user accounts.

The demo provides existing an user to sign with, or you can create your own user.

### Login:

POST to 'localhost:3000/api/auth/login' with a JSON object that includes email and password.  Here is the pre-loaded user:

```
{
  "email": "sally@ccas.site",
  "password": "CorrectHorseBatteryStaple"
}
```

This will return a token that is required to access other routes.

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



### Orders:

GET to 'localhost:3000/api/orders' with a valid token in the header will return a list of current orders in the database. Example with superagent:

```
request
.get(`localhost:3000/api/orders`)
.set('token', token)
```

### Creating an order:

POST to 'localhost:3000/api/orders' with a valid token and order object that includes make, model, package, and customer_id. Example:

```
request
.post(`localhost:3000/api/order`)
.set('token', token)
.send({
  make: 'Honda',
  model: 'Civic',
  package: 'silver',
  customer_id: '59236f515fa3687a7d507b31'
})
```

Make and model are open to any string. Package must be either 'std', 'silver', or 'gold'. The package choice affects the external requests that are created from the local order.

The customer_id must be for an existing customer in the database.

### Healthcheck

This demo also includes a simple healthcheck route that returns {"status": "ok"}.
