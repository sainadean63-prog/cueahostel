FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev && npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
