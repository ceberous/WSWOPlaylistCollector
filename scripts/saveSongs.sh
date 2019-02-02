#!/bin/bash
echo "smembers 'WSWO.SONGS'" | redis-cli -n 3 > songs_base64.txt
#perl -MMIME::Base64 -ne 'print decode_base64($_);print "\n"' songs_base64.txt > songs.txt
perl -MMIME::Base64 -ne 'my $lines =  decode_base64($_); my @values = split( "---" , $lines ); foreach my $val (@values){print "$val ";}print "\n";' songs_base64.txt > songs.txt
perl -MMIME::Base64 -ne 'my $lines =  decode_base64($_); my @values = split( "---" , $lines ); print @values[0]; print " "; print @values[1];print "\n";' songs_base64.txt > songs_simple.txt