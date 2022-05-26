#Setting up SSL on Tomcat and Node/Express
(These instructions use the Java-specific `keytool` command and database format.
Similar steps can be performed using e.g. OpenSSL to create standard PEM files,
and it's possible to convert between the formats.)

##Set up Encryption Assets
These steps should be done each time you configure a server, or annually when the current cert expires (Current cert expiration is around 10/12/19.).

1. Generate a keypair, by creating a new keystore, or augmenting an existing one.  Prefer a .pfx or PKCS12 keystore over the older .jks format.  Give the keypair a name, e.g. "tomcat".  You'll be asked for identifying information; be sure the common name or "first and last name" is www.softwareinventions.com since this will be included in the Certificate Request when you generate it, and must match the domain name for which you want a a cert.  Sample command:

        keytool -genkeypair -alias tomcat -keyalg RSA -storetype PKCS12 -keysize 2048 -keystore /var/lib/tomcat7/keystore.pfx

2. Make sure this keypair works properly with Tomcat.  Adjust if necessary (e.g. alias name, keystore password) the existing Tomcat `server.xml` which contains a functioning SSL configuration.  Consult [Tomcat SSL documentation](https://tomcat.apache.org/tomcat-7.0-doc/ssl-howto.html) for more details.

3. Make a backup of the keystore file.

4. Create a certificate signing request (CSR).

        keytool -certreq -keyalg RSA -alias tomcat -file ~/certreq.csr -keystore /var/lib/tomcat7/keystore.pfx

5. Use the csr to purchase an SSL cert from a provider such as [Namecheap](https://www.namecheap.com/security/ssl-certificates.aspx).

6. Complete any necessary validation (e.g. responding to an email).

7. The provider will return several PEM or crt files representing the trust chain to a widely-trusted certificate authority. These may come in the form of a single .p7b file, which can include a full trust chain and leaf certification, or as a .ca-bundle file for the trust chain and a .crt file for the leaf certification, or individual crt files for every link in the chain.  As of 2018, NameCheap/Comodo supply both a .p7b file and a ca-bundle plus crt as two alternates. Get these via domains|cert button|See Details>Download cert.

### p7b file
The p7b file is importable to the keystore.pfx file via:

### Individual CRT files
Importing the trust chain and leaf cert one cert at a time into the keystore  takes commands such as:

        keytool -import -alias root -keystore /var/lib/tomcat7/keystore -trustcacerts -file COMODORSAAddTrustCA.crt

        keytool -import -alias ca1 -keystore /var/lib/tomcat7/keystore -trustcacerts -file COMODORSADomainValidationSecureServerCA.crt

        keytool -import -alias tomcat -keystore /var/lib/tomcat7/keystore -trustcacerts -file www_softwareinventions_com.crt

## Notes on Node/Express Configuration
Node/Express config uses the ca-bundle and crt file to configure the HTTPS server.  
