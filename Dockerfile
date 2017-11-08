FROM node:8.2.1-alpine
MAINTAINER Jude Zhu <jude.x.zhu@gmail.com>

# Install app dependencies
COPY package.json /issh/package.json
RUN cd /issh; npm install

COPY src /issh
WORKDIR /issh
CMD ["node", "index.js"]
EXPOSE 9999
