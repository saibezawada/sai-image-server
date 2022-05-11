FROM node

WORKDIR /opt/app-root

COPY package*.json ./
COPY . .
COPY ./public/. /public/

RUN npm install --only=prod

ENV NODE_ENV production
ENV PORT 8080

EXPOSE 8080

CMD ["npm", "start"]
