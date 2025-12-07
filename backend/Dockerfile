FROM node:20


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "sleep 10 && node setup_db.js && node sync_db.js && node server.js"]
