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
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE=${DATABASE}
ENV DATABASE_PASSWORD=${DATABASE_PASSWORD}
ENV TEST_DB=${TEST_DB}
ENV PORT=${PORT}
ENV JWT_SECRET=${JWT_SECRET}
ENV JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
ENV JWT_COOKIE_EXPIRES_IN=${JWT_COOKIE_EXPIRES_IN}
ENV EMAIL_FROM=${EMAIL_FROM}
ENV EMAIL_PORT=${EMAIL_PORT}
ENV EMAIL_USERNAME=${EMAIL_USERNAME}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV EMAIL_HOST=${EMAIL_HOST}
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
 ENV NODE_ENV=development
 
 #Expose port 
 EXPOSE 3000
 
 #Start the application
 CMD ["npm", "start"]