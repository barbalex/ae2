FROM node:lts-alpine
ENV NODE_ENV production

RUN npm install -g postgraphile
RUN npm install -g postgraphile-plugin-connection-filter
RUN npm install -g @graphile-contrib/pg-order-by-related
RUN npm install -g postgraphile-upsert-plugin

COPY --chown=node:node .postgraphilerc.js .postgraphilerc.js

EXPOSE 5000

USER node

ENTRYPOINT ["postgraphile", "-n", "0.0.0.0"]