FROM node:20-alpine AS base
RUN apk add ffmpeg
RUN apk add gcompat
RUN apk add curl
USER node
RUN mkdir /home/node/.aws
COPY --chown=node:node containers/credentials /home/node/.aws/credentials

FROM base AS deps
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
COPY --chown=node:node containers/prod.env .env
RUN npm i baseline-browser-mapping@latest -D
RUN npm run build

# ----- PRODUCTION ----
FROM base AS production
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --chown=node:node /piper ./piper

USER root 
RUN ln -s /app/piper/piper /usr/local/bin/piper
USER node

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

# ----- DEVELOPMENT ----
FROM deps AS development
COPY --chown=node:node . .
COPY --from=deps /app/node_modules ./node_modules

USER root 
RUN ln -s /app/piper/piper /usr/local/bin/piper
USER node

EXPOSE 3000
EXPOSE 9229
EXPOSE 9230

ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "dev"]