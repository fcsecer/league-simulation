# 1. Yapı aşaması
FROM node:18-alpine AS build-stage

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve lock dosyasını kopyala
COPY package*.json ./

# Gerekli paketleri yükle
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Angular uygulamasını production için derle
RUN npm run build --prod

# 2. Sunucu aşaması
FROM nginx:alpine AS production-stage

# Build edilen dosyaları nginx'in public dizinine kopyala
COPY --from=build-stage /app/dist/league-simulation /usr/share/nginx/html

# Custom nginx config gerekiyorsa:
# COPY nginx.conf /etc/nginx/nginx.conf

# 80 portunu aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
