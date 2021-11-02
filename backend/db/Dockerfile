# see: https://hub.docker.com/_/postgres
# DANGER: artdaten.ch rund on postgres:12.8, arteigenschaften.ch on 14.0
FROM postgres:12.8
#FROM postgres:14.0

# init db from ae.backup (only runs when no db detected)
COPY ./init/ /docker-entrypoint-initdb.d/
COPY ./ae.backup /sik_data/ae.backup
RUN chmod +x /docker-entrypoint-initdb.d/02_restore.sh

# build backup
# for using cron, see https://www.cloudsavvyit.com/9033/how-to-use-cron-with-your-docker-containers/

# Install some helpful stuff
RUN apt-get -qq update
# log less: https://askubuntu.com/a/668859
RUN apt-get install -y -qq curl
RUN apt-get install -y -qq bash
RUN apt-get install -y -qq nano
RUN apt-get install -y -qq rclone
RUN apt-get install -y -qq dos2unix

# add the backup script
ADD backup.sh /backup.sh
# Change line ending format to LF
RUN dos2unix /backup.sh
RUN chmod +x /backup.sh
RUN chmod 0744 /backup.sh