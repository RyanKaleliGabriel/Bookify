# Stage 1: Build
FROM node:18 AS builder

WORKDIR /

# Set Environment Variables


#iNSTALL DEPENDENCIES
COPY package*.json ./
RUN npm install

#Copy source code
COPY . .

#Build the application
RUN npm run build


# Set Environment Variables
ENV NODE_ENV=test
ENV DATABASE=mongodb+srv://kaleligabriel6:<PASSWORD>@cluster0.75jojyu.mongodb.net/bookify?retryWrites=true&w=majority&appName=Cluster0
ENV DATABASE_PASSWORD=MSY0iI6DHnWW9sVy
ENV TEST_DB=mongodb+srv://kaleligabriel6:MSY0iI6DHnWW9sVy@cluster0.75jojyu.mongodb.net/bookify?retryWrites=true&w=majority&appName=Cluster0
ENV PORT=3000
ENV JWT_SECRET=ryan-kaleli-gabriel-kavilieli
ENV JWT_EXPIRES_IN=90d
ENV JWT_COOKIE_EXPIRES_IN=90
ENV EMAIL_FROM=bookify.com
ENV EMAIL_PORT=587
ENV EMAIL_USERNAME=888c18a44fe1c3
ENV EMAIL_PASSWORD=38d2376e8e0df3
ENV EMAIL_HOST=sandbox.smtp.mailtrap.io

#TEST the build application
RUN npm test

#Stage 2: Production
FROM node:18-alpine

WORKDIR /

#Install dependencies
COPY package*.json ./
RUN npm install

# Copy built files from builder
COPY --from=builder /dist ./dist
ENV NODE_ENV=production

#Expose port 
EXPOSE 3000

#Start the application
CMD ["npm", "start"]

