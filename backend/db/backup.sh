# dumped ae
# stellt dem Filenamen das Datum voran
# verschiebt das File auf die dropbox
echo "creating dump file..."
FILENAME=$(date +"%Y-%m-%d_%H-%M-%S_ae.backup")
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -U postgres -h localhost --file=/sik_data/$FILENAME -Fc -Z9 ae
# TODO: only copy to dropbox if file size has changed
# Because this is efficient, change crontab to run also on weekends
# How to:
# if no last.backup exists: 
# 1. copy to dropbox
# 2. rename $FILENAME to last.backup
# Check if size has changed: https://stackoverflow.com/a/63976250/712005
# If size has changed:
# 1. copy to dropbox
# 2. delete last.backup
# 3. rename $FILENAME to last.backup
# If size has not changed:
# delete $FILENAME
echo "uploading dump file..."
rclone move /sik_data/$FILENAME dropbox:Apps/artendb
echo "backed up $FILENAME" >> /var/log/cron.log 2>&1