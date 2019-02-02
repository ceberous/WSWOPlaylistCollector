#!/bin/bash
echo "smembers 'WSWO.SONGS'" | redis-cli -n 3 > songs_base64.txt