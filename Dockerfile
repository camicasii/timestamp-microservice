# build environment
FROM  node:16-alpine3.16
WORKDIR /app
# ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV PORT=80
COPY . /app
RUN npm install
CMD ["npm", "start"]