# 1. Base engine Node.js v20 (Fast & Slim)
FROM node:20-slim

# 2. Asli Magic: OS level par Python 3 aur FFmpeg install karna
RUN apt-get update && \
    apt-get install -y python3 ffmpeg && \
    apt-get clean

# 3. Server ke andar humara working folder
WORKDIR /app

# 4. Sirf packages ki info copy kar ke install maar
COPY package*.json ./
RUN npm install

# 5. Baaki sara code copy kar
COPY . .

# 6. Server ko bata ke port 8080 par chalna hai (Railway ka default port)
ENV PORT=8080
EXPOSE 8080

# 7. Engine Start Command
CMD ["node", "server.js"]