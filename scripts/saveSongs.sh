#!/bin/bash
echo "smembers 'WSWO.SONGS'" | redis-cli -n 3 > songs_base64.txt
perl -MMIME::Base64 -ne 'print decode_base64($_);print "\n"' songs_base64.txt > songs.txt