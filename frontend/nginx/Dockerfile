FROM nginx:1.25

# Remove o arquivo padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf
