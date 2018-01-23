#!/usr/bin/env bash

set -e # stop script at least one test fail

FILE=./data.json

if [ -f "$FILE" ]
then
   read -p "Remove previous data file? [yY] " remove
   if [ "$remove" == "y" ] || [ "$remove" == "Y" ]
   then
      rm "$FILE"
   fi
fi

for i in {1..1000}; do
   echo "Count: $i"
   npm run test
done
