
# Stage 1: Build
FROM node:18 AS builder

WORKDIR /

#INSTALL DEPENDENCIES
COPY package*.json ./
RUN npm install

#Copy source code
COPY . .

#Build the application
RUN npm run build

#Stage 2: Development
FROM node:18-alpine

WORKDIR /

# Expose port 
EXPOSE 3000

# Copy built files from builder
COPY --from=builder /dist ./dist

COPY package*.json ./
RUN npm install

# Copy environment config to the container
ENV NODE_ENV=production

#Start the application
CMD ["npm", "start"]