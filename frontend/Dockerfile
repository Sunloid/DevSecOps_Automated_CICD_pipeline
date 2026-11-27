# Start from a computer that has node and npm. Call this stage "build"
FROM node:26-alpine AS build                                   
RUN apk --no-cache upgrade

# Work inside a folder called /app
WORKDIR /app

# Copy only package.json and package-lock.json for now
COPY package*.json ./

# Install all the dependencies from the above files
RUN npm ci

# Now copy the rest of the source code
COPY . .

# Turn the source code into a plan website (HTML, CSS, JS) in a "dist" folder. 
RUN npm run build



# Start fresh from a different computer that only has the nginx web server.
FROM nginx:stable-alpine

RUN apk --no-cache upgrade

# Give nginx your settings (serve the site, forward the /api to the backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

#Reach back into stage 1 and copy ONLY the dist folder here 
COPY --from=build /app/dist /usr/share/nginx/html

# This container listens on port 80
EXPOSE 80
