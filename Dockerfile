# Usa una imagen oficial de Node con Python y ffmpeg
FROM node:20-bullseye

# Instala Python, pip, ffmpeg y yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install yt-dlp

# Crea el directorio de la app
WORKDIR /app

# Copia los archivos del proyecto
COPY . .

# Instala dependencias de Node
RUN npm install --omit=dev

# Comando para iniciar el bot
CMD ["npm", "start"] 