FROM node:20-alpine AS base
RUN apk update && apk upgrade
RUN apk add --no-cache openssl

FROM base AS build-stage

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run postinstall
RUN npm run build


FROM base
ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set ignore-scripts true
RUN npm install --omit=dev

COPY --from=build-stage /build/.output ./.output
COPY ./prisma ./prisma

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]