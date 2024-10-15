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
 
 #Stage 2: Development
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