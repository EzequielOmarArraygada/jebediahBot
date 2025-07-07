FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Limpiar caché y instalar dependencias
RUN npm cache clean --force && npm ci --only=production

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 8080

# Comando de inicio
CMD ["npm", "start"] 