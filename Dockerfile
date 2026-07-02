FROM node:24-alpine AS installer

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:24-alpine AS builder

WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules

COPY . .
RUN npm run build

FROM nginx:alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]