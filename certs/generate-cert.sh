openssl genrsa -des3 -passout pass:x -out server.pass.key 2048

openssl rsa -passin pass:x -in server.pass.key -out server.key

rm server.pass.key

openssl req -new -key server.key -out server.csr

openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt

#Convert to PEM format
openssl x509 -in server.crt -out cert.pem -outform PEM
openssl rsa -in server.key -text > privatekey.pem