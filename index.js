/**
 * This is a quick start example of creating and sending an envelope to be signed.
 * Language: Node.js
 *
 * See the Readme and Setup files for more information.
 *
 * Copyright (c) DocuSign, Inc.
 * License: MIT Licence. See the LICENSE file.
 *
 * This example does not include authentication. Instead, an access token
 * must be supplied from the Token Generator tool on the DevCenter or from
 * elsewhere.
 *
 * This example also does not look up the DocuSign account id to be used.
 * Instead, the account id must be set.
 *
 * For a more production oriented example, see:
 *   JWT authentication: https://github.com/docusign/eg-01-node-jwt
 *   or Authorization code grant authentication. Includes express web app:
 *      https://github.com/docusign/eg-03-node-auth-code-grant
 * @file index.js
 * @author DocuSign
 * @see <a href="https://developers.docusign.com">DocuSign Developer Center</a>
 */
const docusign = require("docusign-esign"),
  path = require("path"),
  fs = require("fs"),
  process = require("process"),
  { promisify } = require("util"), // http://2ality.com/2017/05/util-promisify.html
  basePath = "https://demo.docusign.net/restapi",
  express = require("express"),
  envir = process.env;
// baseUrl is the url of the application's web server. Eg http://localhost:3000
// In some cases, this example can determine the baseUrl automatically.
// See the baseUrl statements at the end of this example.
let baseUrl = envir.BASE_URL || "http://localhost:3000";

async function openSigningCeremonyController(req, res) {
  const qp = req.query;
  // Fill in these constants or use query parameters of ACCESS_TOKEN, ACCOUNT_ID, USER_FULLNAME, USER_EMAIL
  // or environment variables.

  // Obtain an OAuth token from https://developers.docusign.com/oauth-token-generator
  const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjY4MTg1ZmYxLTRlNTEtNGNlOS1hZjFjLTY4OTgxMjIwMzMxNyJ9.eyJUb2tlblR5cGUiOjUsIklzc3VlSW5zdGFudCI6MTU4MjU0NTcyMCwiZXhwIjoxNTgyNTc0NTIwLCJVc2VySWQiOiIwNjBkMDQ1Ni00ODZhLTQyNDctODEzZi0zMWUwYTFkNmNjMWYiLCJzaXRlaWQiOjEsInNjcCI6WyJzaWduYXR1cmUiLCJjbGljay5tYW5hZ2UiLCJvcmdhbml6YXRpb25fcmVhZCIsInJvb21fZm9ybXMiLCJncm91cF9yZWFkIiwicGVybWlzc2lvbl9yZWFkIiwidXNlcl9yZWFkIiwidXNlcl93cml0ZSIsImFjY291bnRfcmVhZCIsImRvbWFpbl9yZWFkIiwiaWRlbnRpdHlfcHJvdmlkZXJfcmVhZCIsImR0ci5yb29tcy5yZWFkIiwiZHRyLnJvb21zLndyaXRlIiwiZHRyLmRvY3VtZW50cy5yZWFkIiwiZHRyLmRvY3VtZW50cy53cml0ZSIsImR0ci5wcm9maWxlLnJlYWQiLCJkdHIucHJvZmlsZS53cml0ZSIsImR0ci5jb21wYW55LnJlYWQiLCJkdHIuY29tcGFueS53cml0ZSJdLCJhdWQiOiJmMGYyN2YwZS04NTdkLTRhNzEtYTRkYS0zMmNlY2FlM2E5NzgiLCJhenAiOiJmMGYyN2YwZS04NTdkLTRhNzEtYTRkYS0zMmNlY2FlM2E5NzgiLCJpc3MiOiJodHRwczovL2FjY291bnQtZC5kb2N1c2lnbi5jb20vIiwic3ViIjoiMDYwZDA0NTYtNDg2YS00MjQ3LTgxM2YtMzFlMGExZDZjYzFmIiwiYW1yIjpbImludGVyYWN0aXZlIl0sImF1dGhfdGltZSI6MTU4MjU0NTcxNiwicHdpZCI6IjhkZDM2NDg5LWMxMTMtNDU1NS1hNmQyLWQ1ZDBiYmY0ODVmOCJ9.roWaN4QthU29kAjAi_YhYEmzvMCyTMgV5E_W5k9NJrjRQCbaWmZhA-O3tv8G7tzivPl84BCNX4oDVkQxCloQs9iugxvFIuquyHrRPY0XGdtz8iVCPy_TeQpLVG5qq_aj_KByUjx8jpGBS_hl30ptGSryzauJ-Q95ITZLcefzNch0QLdcmDpgYB2sQVOGq8x8xbrchctmETaqq5VcFtES3dX1dZVEBpNK9lsscgWd4hOZ1YPVHPRsxDtuKxisoOaSdbKJT_BMMuVOHJdmpk_Dt46pMXUu8EWahFvHmGOY3MzSrbCE-8hD2-3XrkGU8Viqsx8Vdh38N8ZOYnzrW3Y0Xw";

  // Obtain your accountId from demo.docusign.com -- the account id is shown in the drop down on the
  // upper right corner of the screen by your picture or the default picture.
  const accountId = "9965049";

  // Recipient Information:
  const signerName = "Rodolpho Silva";
  const signerEmail = "rodolpho.silva@dieboldnixdorf.com";

  const clientUserId = "123", // Used to indicate that the signer will use an embedded
    // Signing Ceremony. Represents the signer's userId within
    // your application.
    authenticationMethod = "None"; // How is this application authenticating
  // the signer? See the `authenticationMethod' definition
  // https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeViews/createRecipient

  // Id of the recipient, change be changed when testing
  const recipientId = "5";

  // The document to be signed. Path is relative to the root directory of this repo.
  const fileName = "demo_documents/World_Wide_Corp_lorem.pdf";
  /**
   *  Step 1. The envelope definition is created.
   *          One signHere tab is added.
   *          The document path supplied is relative to the working directory
   */
  const envDef = new docusign.EnvelopeDefinition();
  //Set the Email Subject line and email message
  envDef.emailSubject = "Please sign this document sent from the Node example";
  envDef.emailBlurb = "Please sign this document sent from the Node example.";

  // Read the file from the document and convert it to a Base64String
  const pdfBytes = fs.readFileSync(path.resolve(__dirname, fileName)),
    pdfBase64 = pdfBytes.toString("base64");

  // Create the document request object
  const doc = docusign.Document.constructFromObject({
    documentBase64: pdfBase64,
    fileExtension: "pdf", // You can send other types of documents too.
    name: "Sample document",
    documentId: "1"
  });

  // Create a documents object array for the envelope definition and add the doc object
  envDef.documents = [doc];

  // Create the signer object with the previously provided name / email address
  const signer = docusign.Signer.constructFromObject({
    name: signerName,
    email: signerEmail,
    routingOrder: "1",
    recipientId,
    clientUserId: clientUserId
  });

  // Create the signHere tab to be placed on the envelope
  const signHere = docusign.SignHere.constructFromObject({
    documentId: "1",
    pageNumber: "1",
    recipientId,
    tabLabel: "SignHereTab",
    xPosition: "195",
    yPosition: "147"
  });

  // Create the overall tabs object for the signer and add the signHere tabs array
  // Note that tabs are relative to receipients/signers.
  signer.tabs = docusign.Tabs.constructFromObject({ signHereTabs: [signHere] });

  // Add the recipients object to the envelope definition.
  // It includes an array of the signer objects.
  envDef.recipients = docusign.Recipients.constructFromObject({
    signers: [signer]
  });
  // Set the Envelope status. For drafts, use 'created' To send the envelope right away, use 'sent'
  envDef.status = "sent";
  /**
   *  Step 2. Create/send the envelope.
   *          We're using a promise version of the SDK's createEnvelope method.
   */
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
  // Set the DocuSign SDK components to use the apiClient object
  docusign.Configuration.default.setDefaultApiClient(apiClient);
  let envelopesApi = new docusign.EnvelopesApi(),
    // createEnvelopePromise returns a promise with the results:
    createEnvelopePromise = promisify(envelopesApi.createEnvelope).bind(
      envelopesApi
    ),
    results;

  try {
    results = await createEnvelopePromise(accountId, {
      envelopeDefinition: envDef
    });
    /**
     * Step 3. The envelope has been created.
     *         Request a Recipient View URL (the Signing Ceremony URL)
     */
    const envelopeId = results.envelopeId,
      recipientViewRequest = docusign.RecipientViewRequest.constructFromObject({
        authenticationMethod: authenticationMethod,
        clientUserId: clientUserId,
        recipientId,
        returnUrl: "https://www.dieboldnixdorf.com.br/",
        userName: signerName,
        email: signerEmail
      }),
      createRecipientViewPromise = promisify(
        envelopesApi.createRecipientView
      ).bind(envelopesApi);
    results = await createRecipientViewPromise(accountId, envelopeId, {
      recipientViewRequest: recipientViewRequest
    });
    /**
     * Step 4. The Recipient View URL (the Signing Ceremony URL) has been received.
     *         Redirect the user's browser to it.
     */
    res.send(results.url);
  } catch (e) {
    // Handle exceptions
    let body = e.response && e.response.body;
    if (body) {
      // DocuSign API exception
      res.send(`<html lang="en"><body>
                  <h3>API problem</h3><p>Status code ${e.response.status}</p>
                  <p>Error message:</p><p><pre><code>${JSON.stringify(
                    body,
                    null,
                    4
                  )}</code></pre></p>`);
    } else {
      // Not a DocuSign exception
      throw e;
    }
  }
}

// The mainline
const port = process.env.PORT || 3000,
  host = process.env.HOST || "localhost",
  app = express()
    .get("/", openSigningCeremonyController)
    .listen(port, host);
console.log(`Your server is running on ${host}:${port}`);
