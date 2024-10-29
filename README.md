# Bookify API

> Bookify is a scheduling and appointment booking Restful API that allows attendants and clients to interact seamlessly. Clients can book appointments, while attendants can manage their availability. 

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture and principles](#architecture-and-principles)
- [Testing](#testing)
- [Some DevOps](#some-devops)
- [Deployment](#deployment)
- [Security Practices](security-practices)
- [Performance Practices](performance-practices)


## Features
- **User Registration & Authentication**: Role-based sign-up as either elient or client
- **Availability Management**: Attendants can specify their availability for flexible timeframes.
- **Appointment Scheduling**: Clients can book, cancel, and reschedule appointments.
- **Conflict Validation**: Availability and booking conflicts are validated and prevented.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens), Cookies
- **Testing**: Supertest for API testing, Jest, Postman
- **Containerization**: Multi-Stage Docker Builds
- **CI/CD**: Github Actions

## Architecture and principle
**MVC** - Utilised the Model-View-Controller Architecture, this ia a design pattern that separates and application into three main logical components Model, View and Controller. It isolates the business logic and presentation layer fro each other

**DRY** - Don't repeat yourself is a principle used in this project to reduce the repition of patterns and code duplication in favour of abstractions and avoiding redundancy especially in the controller level.

 ## Testing
**Unit Tests** - Focused on writing unit tests for the utility functions that were reusable.

**Integration Tests** - Tested the interaction between different Components in the API. In this case tested the interaction between the controllers and database.

## Some DevOps

**Multi-Stage Docker Builds** - This separated the build environment from the final runtime environment, reducing the image size and attack surface.

**Continuous Integartion and deployment** - Used github actions to build the applications pipeline that was linked to docker hub.

 - Installed dependencies
 - Run tests
 - Built the docker image
 - Pushed the image to docker hub.

 ## Deployment
**Render** - Pulled the image from docker hub and run the image as a web service

## Security Practices
**X-Powered-By Header** - Disbaled this header to reduce fingerprinting. Reduces the ability of attacker to determine the software the server uses.

**Setting Appropriate Headers** - Used the helmet package to protect the app from some well known vulnerabilities by setting HTTP headers appropriately.

**Rate Limiting** - Used a package to limit the number of  requests coming from the same IP to 100 in an hour. This helps in preventing Brute force and DDOS attacks

**NOSql injections** - Used mongo-sanitize package to prevent nosql injection attacks.

## Performance Practices
**Gzip Compression** - Decreased the size of the response body.

**Logging** - Used morgan to log the application's activity
