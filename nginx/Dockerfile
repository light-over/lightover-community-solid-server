FROM nginx:alpine

# Expose the listening port
EXPOSE 80

# Copy config files
# *.conf files in "conf.d/" dir get included in main config
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
