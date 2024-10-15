FROM node as builder

copy . .

run npm install
run npm run build

FROM nginxinc/nginx-unprivileged:1.27.1-alpine

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx build/ /var/www/

RUN sh -c 'find /var/www/ -iname *.js | xargs -n 1 gzip -k'

