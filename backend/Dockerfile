# INTENTIONAL WEAKNESSES: end-of-life base image, runs as root, dev deps installed
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
USER node
CMD ["node", "src/index.js"]
