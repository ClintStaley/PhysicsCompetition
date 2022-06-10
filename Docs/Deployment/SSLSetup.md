# Setting up SSL on Apache

## Read Up
We'll use the openssl tool for this segment.  Read up on concepts and openssl at:

### General
 * [General concepts and Prep](https://www.ssl.com/guide/ssl-best-practices/) from ssl.com
 * [Relevant file formats/endings](https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/)
 * [Good validation and diagnostic tool](https://www.sslshopper.com/ssl-checker.html#hostname=www.softwareinventions.com)

### Openssl
 * [Digicert on openssl](https://www.digicert.com/kb/csr-ssl-installation/apache-openssl.htm)
 * [and more on openssl](https://wiki.openssl.org/index.php/Command_Line_Utilities)
 * [openssl and keytool](https://cheapsslsecurity.com/blog/various-types-ssl-commands-keytool/)

### Keytool
 * [IBM Docs](https://www.ibm.com/docs/en/sdk-java-technology/7.1?topic=keytool-key-certificate-management-tool)
 * [Common commands](https://www.rapidsslonline.com/blog/simple-guide-java-keytool-keystore-commands/)
 * [SSLshopper](https://www.sslshopper.com/article-most-common-java-keytool-keystore-commands.html)

## Get a Cert
  * Pick a site (ComodoSSL was a good choice in 2022).
  * Generate the CSR 
    * (note that the begin/end banners are part of the CSR)
    * good idea to do a check on the CSR to be sure e.g. it has the right name
  
## Figure out Apache config

### mod_ssl
You need the mod_ssl Apache module, which is usually already installed.

 * [Installing mod_ssl for Apache](https://stackoverflow.com/questions/5257974/how-to-install-mod-ssl-for-apache-httpd)

### Config for mod_ssl
A VirtualHost configuration is needed to set up the necessary file pointes to
the key, cert, and trust chain.  This is already mocked up in the config for
mod_ssl and you can mostly use the commented out example sections.  Look for
this in either `httpd.conf` or one of the module-specific conf files, e.g. 
`/etc/httpd/conf.d/ssl.conf`

These conf files in turn refer to a directory containing keys, certs, and trust
chain files, e.g. `/etc/pki/tls`

### Representative commands

 * sudo openssl req -out SI.csr -new -newkey rsa:2048 -nodes -keyout SI.key
 * openssl req -noout -text -in SI.csr
 * openssl rsa -in SI2.key -check  (will prompt for passphrase)

### Useful Notes

 * Public key is included in the cert, and not generally held in separate file.
 * Encryption of private key is adviseable, and can be done during key creation by omitting "-nodes" (which should be read as No DES).  But I found it hard to get Apache to prompt for the passphrase during startup.

## Install cert and key on Apache
  * First baseline the apache server using the pre-provided self-signed cert.
   The test link above is a good source.
  * Change the conf file using the cert, the trust chain, and the key.  Note that at
  least cert and key must align or the service start will fail.
  * Restart Apache.

# Setting up SSL on Tomcat (old)

These instructions use the Java-specific `keytool` command and database format and date from late 2010s so may be obsolete.

##Set up Encryption Assets
These steps should be done each time you configure a server, or annually when 
the current cert expires (Current cert expiration is around 10/12/19.).

1. Generate a keypair, by creating a new keystore, or augmenting an existing
one.  Prefer a .pfx or PKCS12 keystore over the older .jks format.  Give the
keypair a name, e.g. "SI".  You'll be asked for identifying information; be 
sure the common name or "first and last name" is www.softwareinventions.com 
since this will be included in the Certificate Request when you generate it, 
and must match the domain name for which you want a a cert.  Sample command:

        keytool -genkeypair -alias SI -keyalg RSA -storetype PKCS12 -keysize 2048 -keystore /var/lib/tomcat7/keystore.pfx


2. Make sure this keypair works properly with Tomcat.  Adjust if necessary 
(e.g. alias name, keystore password) the existing Tomcat `server.xml` which 
contains a functioning SSL configuration.  Consult [Tomcat SSL documentation]
(https://tomcat.apache.org/tomcat-7.0-doc/ssl-howto.html) for more details.

3. Make a backup of the keystore file.

4. Create a certificate signing request (CSR).

        keytool -certreq -keyalg RSA -alias tomcat -file ~/certreq.csr -keystore /var/lib/tomcat7/keystore.pfx

5. Use the csr to purchase an SSL cert from a provider such as 
[Namecheap](https://www.namecheap.com/security/ssl-certificates.aspx).

6. Complete any necessary validation (e.g. responding to an email).

7. The provider will return several PEM or crt files representing the trust 
chain to a widely-trusted certificate authority. These may come in the form of 
a single .p7b file, which can include a full trust chain and leaf certification, 
or as a .ca-bundle file for the trust chain and a .crt file for the leaf 
certification, or individual crt files for every link in the chain.  As of 2018, 
NameCheap/Comodo supply both a .p7b file and a ca-bundle plus crt as two 
alternates. Get these via domains|cert button|See Details>Download cert.

### p7b file
The p7b file is importable to the keystore.pfx file via:

### Individual CRT files
Importing the trust chain and leaf cert one cert at a time into the keystore  
takes commands such as:

        keytool -import -alias root -keystore /var/lib/tomcat7/keystore -trustcacerts -file COMODORSAAddTrustCA.crt

        keytool -import -alias ca1 -keystore /var/lib/tomcat7/keystore -trustcacerts -file COMODORSADomainValidationSecureServerCA.crt

        keytool -import -alias tomcat -keystore /var/lib/tomcat7/keystore -trustcacerts -file www_softwareinventions_com.crt

## Notes on Node/Express Configuration
Node/Express config uses the ca-bundle and crt file to configure the HTTPS 
server, which you must do if it runs on a separate server instead of behind Apache.
