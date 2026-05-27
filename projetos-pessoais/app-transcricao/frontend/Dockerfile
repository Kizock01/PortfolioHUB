FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Build
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para rodar
CMD ["npm", "start"]
