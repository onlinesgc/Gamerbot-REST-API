FROM node:lts-alpine
ENV NODE_ENV=production
ENV PORT=3000, MONGO_SRV=mongSrv, API_CONFIG_ID=0
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /dist/index.js
USER node
CMD ["npm", "start"]