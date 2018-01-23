#!/usr/bin/env bash

set -e # stop script at least one test fail

FILE=./data.json
COUNT=1000

if [ -f "$FILE" ]
then
   read -p "Remove previous data file? [yY] " remove
   if [ "$remove" == "y" ] || [ "$remove" == "Y" ]
   then
      rm "$FILE"
      echo "Previous data file removed!"
   fi
fi

for i in $(seq 1 $COUNT); do
   echo "Count: $i"
   npm run test
   echo
done
