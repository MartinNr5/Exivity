/* --------------------------------------------------------------------------------------------
 * Copyright (c) Martin Edelius. All rights reserved.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  InsertTextMode,
  InsertTextFormat,
  TextEdit,
  Position,
  MarkupKind,
  MarkupContent,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import internal = require("stream");

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  // Create array of regex to match with and corrsponding messages so that we can loop through them all
  const regexPatterns: RegExp[] = [
    /buffer\s\w+(=\s|\s=\s{0}|=)\w+/g,
    /(if\()/g,
  ];
  const messages: string[] = [
    "requires spaces before and after =.",
    "needs a space between 'if' and opening paranthesis.",
  ];

  for (let i = 0; i < regexPatterns.length; i++) {
    const pattern = regexPatterns[i];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text))) {
      const message = messages[i];
      const thisMessage = `${m[0]} ${message}`;

      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(m.index),
          end: textDocument.positionAt(m.index + m[0].length),
        },
        message: thisMessage,
        source: "ex",
      };
      diagnostics.push(diagnostic);
    }
  }
  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received an file change event");
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
      {
        label: "ifelse (example)",
        kind: CompletionItemKind.Function,
        data: 0,
      },
      {
        label: "foreach (example)",
        kind: CompletionItemKind.Function,
        data: 1,
      },
      {
        label: "MAX",
        kind: CompletionItemKind.Function,
        data: 2,
      },
      {
        label: "MIN",
        kind: CompletionItemKind.Function,
        data: 3,
      },
      {
        label: "ROUND",
        kind: CompletionItemKind.Function,
        data: 4,
      },
      {
        label: "CONCAT",
        kind: CompletionItemKind.Function,
        data: 5,
      },
      {
        label: "SUBSTR",
        kind: CompletionItemKind.Function,
        data: 6,
      },
      {
        label: "STRLEN",
        kind: CompletionItemKind.Function,
        data: 7,
      },
      {
        label: "CURDATE",
        kind: CompletionItemKind.Function,
        data: 8,
      },
      {
        label: "DATEADD",
        kind: CompletionItemKind.Function,
        data: 9,
      },
      {
        label: "DATEDIFF",
        kind: CompletionItemKind.Function,
        data: 10,
      },
      {
        label: "DTADD",
        kind: CompletionItemKind.Function,
        data: 11,
      },
      {
        label: "PAD",
        kind: CompletionItemKind.Function,
        data: 12,
      },
      {
        label: "EXTRACT_BEFORE",
        kind: CompletionItemKind.Function,
        data: 13,
      },
      {
        label: "EXTRACT_AFTER",
        kind: CompletionItemKind.Function,
        data: 14,
      },
      {
        label: "aws_sign_string",
        kind: CompletionItemKind.Function,
        data: 15,
      },
      {
        label: "basename",
        kind: CompletionItemKind.Function,
        data: 16,
      },
      {
        label: "basename as",
        kind: CompletionItemKind.Function,
        data: 17,
      },
      {
        label: "clear http_headers",
        kind: CompletionItemKind.Function,
        data: 18,
      },
      {
        label: "discard",
        kind: CompletionItemKind.Function,
        data: 19,
      },
      {
        label: "encode base16",
        kind: CompletionItemKind.Function,
        data: 20,
      },
      {
        label: "encode base64",
        kind: CompletionItemKind.Function,
        data: 21,
      },
      {
        label: "encrypt",
        kind: CompletionItemKind.Function,
        data: 22,
      },
      {
        label: "environment",
        kind: CompletionItemKind.Function,
        data: 23,
      },
      {
        label: "escape",
        kind: CompletionItemKind.Function,
        data: 24,
      },
      {
        label: "exit_loop",
        kind: CompletionItemKind.Function,
        data: 25,
      },
      {
        label: "generate_jwt",
        kind: CompletionItemKind.Function,
        data: 26,
      },
      {
        label: "get_last_day_of",
        kind: CompletionItemKind.Function,
        data: 27,
      },
      {
        label: "gunzip file",
        kind: CompletionItemKind.Function,
        data: 28,
      },
      {
        label: "gunzip buffer",
        kind: CompletionItemKind.Function,
        data: 29,
      },
      {
        label: "hash sha256",
        kind: CompletionItemKind.Function,
        data: 30,
      },
      {
        label: "hash md5",
        kind: CompletionItemKind.Function,
        data: 31,
      },
      {
        label: "http",
        kind: CompletionItemKind.Function,
        data: 32,
      },
      {
        label: "http dump_headers",
        kind: CompletionItemKind.Function,
        data: 33,
      },
      {
        label: "http get_header",
        kind: CompletionItemKind.Function,
        data: 34,
      },
      {
        label: "json",
        kind: CompletionItemKind.Function,
        data: 35,
      },
      {
        label: "loglevel",
        kind: CompletionItemKind.Function,
        data: 36,
      },
      {
        label: "pause",
        kind: CompletionItemKind.Function,
        data: 37,
      },
      {
        label: "print",
        kind: CompletionItemKind.Function,
        data: 38,
      },
      {
        label: "save",
        kind: CompletionItemKind.Function,
        data: 39,
      },
      {
        label: "set",
        kind: CompletionItemKind.Function,
        data: 40,
      },
      {
        label: "terminate",
        kind: CompletionItemKind.Function,
        data: 41,
      },
      {
        label: "terminate with error",
        kind: CompletionItemKind.Function,
        data: 42,
      },
      {
        label: "unzip",
        kind: CompletionItemKind.Function,
        data: 43,
      },
      {
        label: "uri encode",
        kind: CompletionItemKind.Function,
        data: 44,
      },
      {
        label: "uri component-encode",
        kind: CompletionItemKind.Function,
        data: 45,
      },
      {
        label: "uri aws-object-encode",
        kind: CompletionItemKind.Function,
        data: 46,
      },
      {
        label: "buffer",
        kind: CompletionItemKind.Function,
        data: 47,
      },
      {
        label: "csv",
        kind: CompletionItemKind.Function,
        data: 48,
      },
      {
        label: "csv add_headers",
        kind: CompletionItemKind.Function,
        data: 49,
      },
      {
        label: "csv fix_headers",
        kind: CompletionItemKind.Function,
        data: 50,
      },
      {
        label: "csv write_fileds",
        kind: CompletionItemKind.Function,
        data: 51,
      },
      {
        label: "csv close",
        kind: CompletionItemKind.Function,
        data: 52,
      },
      {
        label: "decimal_to_ipv4",
        kind: CompletionItemKind.Function,
        data: 53,
      },
      {
        label: "decimal_to_ipv4 as",
        kind: CompletionItemKind.Function,
        data: 54,
      },
      {
        label: "gosub",
        kind: CompletionItemKind.Function,
        data: 55,
      },
      {
        label: "ipv4_to_decimal",
        kind: CompletionItemKind.Function,
        data: 56,
      },
      {
        label: "ipv4_to_decimal as",
        kind: CompletionItemKind.Function,
        data: 57,
      },
      {
        label: "loop",
        kind: CompletionItemKind.Function,
        data: 58,
      },
      {
        label: "lowercase",
        kind: CompletionItemKind.Function,
        data: 59,
      },
      {
        label: "match",
        kind: CompletionItemKind.Function,
        data: 60,
      },
      {
        label: "return",
        kind: CompletionItemKind.Function,
        data: 61,
      },
      {
        label: "subroutine",
        kind: CompletionItemKind.Function,
        data: 62,
      },
      {
        label: "uppercase",
        kind: CompletionItemKind.Function,
        data: 63,
      },
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  const suggestions = [
    {
      label: "ifelse (example)",
      kind: CompletionItemKind.Snippet,
      insertText: ["if (${1:condition}) {", "\t$0", "} else {", "\t", "}"].join(
        "\n"
      ),
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "If-Else Statement",
    },
    {
      label: "foreach (example)",
      kind: CompletionItemKind.Snippet,
      insertText: [
        "foreach \\$JSON{${1:RESPONSE}}.[KEY] as record {",
        // eslint-disable-next-line no-tabs
        "	csv write_field my_csv $JSON(record).[my_key]",
        "}",
      ].join("\n"),
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Example for looping over a JSON response payload",
    },
    {
      label: "MAX",
      kind: CompletionItemKind.Function,
      insertText: "@MAX(${1:<number>}, ${2:<number>} ${3:[, <number> ...]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns the largest number from the specified list (requires at least 2 arguments).",
    },
    {
      label: "MIN",
      kind: CompletionItemKind.Function,
      insertText: "@MIN(${1:<number>}, ${2:<number>} ${3:[, <number> ...]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns the smallest number from the specified list (requires at least 2 arguments).",
    },
    {
      label: "ROUND",
      kind: CompletionItemKind.Function,
      insertText: "@ROUND(${1:<number>} ${2:[, <digits>]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns number rounded to digits decimal places. If the digits argument is not specified then the function will round to the nearest integer.",
    },
    {
      label: "CONCAT",
      kind: CompletionItemKind.Function,
      insertText:
        "@CONCAT(${1:<string1>, ${2:<string2>} ${3:[, <stringN> ...]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Treats all its arguments as strings, concatenates them, and returns the result.",
    },
    {
      label: "SUBSTR",
      kind: CompletionItemKind.Function,
      insertText: "@SUBSTR(${1:<string>}, ${2:<start>} ${3:[, <length>]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns a sub-string of string, starting from the character at position start and continuing until the end of the string end until the character at position length, whichever is shorter.",
    },
    {
      label: "STRLEN",
      kind: CompletionItemKind.Function,
      insertText: "@STRLEN(${1:<string>})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Returns the length of its argument in bytes.",
    },
    {
      label: "CURDATE",
      kind: CompletionItemKind.Function,
      insertText: "@CURDATE()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns the current (actual) date in the timezone of the Exivity server. The format may be any valid combination of strftime specifiers. The default format is %Y%m%d which returns a date in yyyyMMdd format",
    },
    {
      label: "DATEADD",
      kind: CompletionItemKind.Function,
      insertText: "@DATEADD(${1:<date>}, ${2:<days>})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Adds a specified number of days to the given date, returning the result as a *yyyyMMdd* date.",
    },
    {
      label: "DATEDIFF",
      kind: CompletionItemKind.Function,
      insertText: "@DATEDIFF(${1:<date1>}, ${2:<date2>})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns the difference in days between two yyyyMMdd dates. A positive result means that date1 is later than date2. A negative result means that date2 is later than date1. A result of 0 means that the two dates are the same.",
    },
    {
      label: "DTADD",
      kind: CompletionItemKind.Function,
      insertText: "@DTADD(${1:<datetime>}, ${2:<count>} ${3:[, <units>]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Adds count number of unit_s (DAYS by default) to the specified datetime value and return normalised result datetime value in YYYYMMDDhhmmss_ format.",
    },
    {
      label: "PAD",
      kind: CompletionItemKind.Function,
      insertText: "@DTADD(${1:<width>}, ${2:<value>} ${3:[, <pad_char>]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns value, left-padded with pad_char (0 by default) up to specified width. If width is less than or equal to the width of value, no padding occurs.",
    },
    {
      label: "EXTRACT_BEFORE",
      kind: CompletionItemKind.Function,
      insertText: "@EXTRACT_BEFORE(${1:<string>}, ${2:<pattern>})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns the substring of string that precedes the pattern. If pattern cannot be found in the string, or either string or pattern are empty, result of the function is empty string.",
    },
    {
      label: "EXTRACT_AFTER",
      kind: CompletionItemKind.Function,
      insertText: "@EXTRACT_AFTER(${1:<string>}, ${2:<pattern>})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Returns the substring of string that follows the pattern. If pattern cannot be found in the string, or either string or pattern are empty, result of the function is empty string.",
    },
    {
      label: "aws_sign_string",
      kind: CompletionItemKind.Function,
      insertText:
        "aws_sign_string ${1:<varName>} using ${2:<secret_key>} ${3:<date>} ${4:<region>} ${5:<service>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Generates an AWS4-HMAC-SHA256 signature, used as the signature component of the Authorization HTTP header when calling the AWS API.",
    },
    {
      label: "basename",
      kind: CompletionItemKind.Function,
      insertText: "basename ${1:<var_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Extracts the filename portion of a path + filename string.",
    },
    {
      label: "basename as",
      kind: CompletionItemKind.Function,
      insertText: "basename ${1:<string>} as ${2:<var_name>}",
      sortText: "basename",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Extracts the filename portion of a path + filename string into a separate variable.",
    },
    {
      label: "clear http_headers",
      kind: CompletionItemKind.Function,
      insertText: "clear http_headers",
      sortText: "clear",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Deletes all HTTP headers previously configured using the set http_header statement",
    },
    {
      label: "discard",
      kind: CompletionItemKind.Function,
      insertText: "discard {${1:<buffer_name>}}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Deletes a named buffer.",
    },
    {
      label: "encode base16",
      kind: CompletionItemKind.Function,
      insertText: "encode base16 ${1:<var_or_buffer>}",
      sortText: "encode",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Base16 encodes the contents of a variable or a named buffer.",
    },
    {
      label: "encode base64",
      kind: CompletionItemKind.Function,
      insertText: "encode base64 ${1:<var_or_buffer>}",
      sortText: "encode",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Base64 encodes the contents of a variable or a named buffer.",
    },
    {
      label: "encrypt",
      kind: CompletionItemKind.Function,
      insertText: "encrypt var ${1:<var_name>} = ${2:<value>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Conceals the value of a variable, such that it does not appear in plain text in a USE script.",
    },
    {
      label: "environment",
      kind: CompletionItemKind.Function,
      insertText: "environment ${1:<name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Specifies the name of the environment to use for resolving global variables.",
    },
    {
      label: "escape",
      kind: CompletionItemKind.Function,
      insertText:
        "escape quotes in ${1:<var_or_buffer>} ${2:[using <escape_char>]}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Escapes quotes in a variable value or the contents of a named buffer.",
    },
    {
      label: "exit_loop",
      kind: CompletionItemKind.Function,
      insertText: "exit_loop",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Terminates the current loop.",
    },
    {
      label: "generate_jwt",
      kind: CompletionItemKind.Function,
      insertText:
        "generate_jwt key ${1:<key> ${2:<component>} ${3:[... <component>]} as ${4:<var_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Generates an RFC 7515-compliant JWT (JSON Web Token) which can be used, for example, for Google Cloud OAuth 2.0 Server to Server Authentication.",
    },
    {
      label: "get_last_day_of",
      kind: CompletionItemKind.Function,
      insertText: "get_last_day_of ${1:<yyyyMM>} as ${2:<var_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Sets a variable to contain the number of days in the specified month.",
    },
    {
      label: "gunzip file",
      kind: CompletionItemKind.Function,
      insertText: "gunzip ${1:<filename>} as ${2:<filename>}",
      sortText: "gunzip",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inflates a GZIP file.",
    },
    {
      label: "gunzip buffer",
      kind: CompletionItemKind.Function,
      insertText: "gunzip {${1:<buffer_name>}} as ${2:<filename>}",
      sortText: "gunzip",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inflates a GZIP buffer.",
    },
    {
      label: "hash sha256",
      kind: CompletionItemKind.Function,
      insertText:
        "hash sha256 ${1:[HMAC [b16|b64] <key>]} ${2:<var_or_buffer>} as ${3:<var_name>} ${4:[b16|b64]}",
      sortText: "hash",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Generates a base-16 or base-64 encoded SHA256 hash of data stored in a variable or named buffer.",
    },
    {
      label: "hash md5",
      kind: CompletionItemKind.Function,
      insertText:
        "hash md5 ${1:<var_or_buffer>} as ${2:<var_name>} ${3:[b16|b64]}",
      sortText: "hash",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Generates a base-16 or base-64 encoded MD5 hash of data stored in a variable or named buffer.",
    },
    {
      label: "http",
      kind: CompletionItemKind.Function,
      insertText: "http ${1:<method>} ${2:<url>}",
      sortText: "http",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Initiates an HTTP session using any settings previously configured using the set statement.",
    },
    {
      label: "http dump_headers",
      kind: CompletionItemKind.Function,
      insertText: "http dump_headers",
      sortText: "http",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Dumps a list of all the response headers returned by the server in the most recent session.",
    },
    {
      label: "http get_header",
      kind: CompletionItemKind.Function,
      insertText: "http get_header ${1:<header_name>} as ${2:<var_name>}",
      sortText: "http",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Retrieves the value of a specific header.",
    },
    {
      label: "json",
      kind: CompletionItemKind.Function,
      insertText: "json format {${1:<buffer_name>}}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Formats JSON in a named buffer.",
    },
    {
      label: "loglevel",
      kind: CompletionItemKind.Function,
      insertText: "loglevel ${1:<level>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Determines the amount of detail recorded in the USE script logfile.",
    },
    {
      label: "pause",
      kind: CompletionItemKind.Function,
      insertText: "pause ${1:<delaytime>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Suspends execution of a USE script for a specified time.",
    },
    {
      label: "print",
      kind: CompletionItemKind.Function,
      insertText: "print ${1:[-n]} ${2:<text_or_buffer>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Display text to standard output while a USE script is executing.",
    },
    {
      label: "save",
      kind: CompletionItemKind.Function,
      insertText: "save {${1:<buffer_name>}} as ${2:<file_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Writes the contents of a named buffer to disk.",
    },
    {
      label: "set",
      kind: CompletionItemKind.Function,
      insertText: "set ${1:<setting>} ${2:<value>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Configures a setting for use by subsequent http or buffer statements.",
    },
    {
      label: "terminate",
      kind: CompletionItemKind.Function,
      insertText: "terminate",
      sortText: "terminate",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Exits the USE script immediately.",
    },
    {
      label: "terminate with error",
      kind: CompletionItemKind.Function,
      insertText: "terminate with error",
      sortText: "terminate",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Exits the USE script immediately, logging an error.",
    },
    {
      label: "unzip",
      kind: CompletionItemKind.Function,
      insertText: "unzip {${1:<buffer_name>}}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Unzips the data in a named buffer.",
    },
    {
      label: "uri encode",
      kind: CompletionItemKind.Function,
      insertText: "uri encode ${1:<var_name>}",
      sortText: "uri",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Encodes the contents of a variable such that it does not contain any illegal or ambiguous characters when used in an HTTP request.",
    },
    {
      label: "uri component-encode",
      kind: CompletionItemKind.Function,
      insertText: "uri component-encode ${1:<var_name>}",
      sortText: "uri",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Encodes the contents of a variable such that it does not contain any illegal or ambiguous characters when used in an HTTP request.",
    },
    {
      label: "uri aws-object-encode",
      kind: CompletionItemKind.Function,
      insertText: "uri aws-object-encode ${1:<var_name>}",
      sortText: "uri",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Encodes the contents of a variable such that it does not contain any illegal or ambiguous characters when used in an HTTP request.",
    },
    {
      label: "buffer",
      kind: CompletionItemKind.Function,
      insertText:
        "buffer ${1:<var_name>} = protocol ${2:[... <protocol_parameter(s)>]}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Used to create and/or populate one of these named buffers with data.",
    },
    {
      label: "csv",
      kind: CompletionItemKind.Function,
      insertText: "csv ${1:<label_name>} = ${2:<file_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Used to create CSV files.",
    },
    {
      label: "csv add_headers",
      kind: CompletionItemKind.Function,
      insertText:
        "csv add_headers ${1:<label_name>} ${2:<header1>} ${3:<header2>} ${4:[<headerN> ...]}",
      sortText: "csv",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Used to add headers to CSV files.",
    },
    {
      label: "csv fix_headers",
      kind: CompletionItemKind.Function,
      insertText: "csv fix_headers ${1:<label_name>}",
      sortText: "csv",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Used to permanently set the headers for CSV files so that data can be written to the file.",
    },
    {
      label: "csv write_fields",
      kind: CompletionItemKind.Function,
      insertText:
        "csv write_fields ${1:<label_name>} ${2:<value1>} ${3:<value2>} ${4:[<valueN> ...]}",
      sortText: "csv",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Used to write data to CSV files.",
    },
    {
      label: "csv close",
      kind: CompletionItemKind.Function,
      insertText: "csv close ${1:<label_name>}",
      sortText: "csv",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Used to close CSV files.",
    },
    {
      label: "decimal_to_ipv4",
      insertText: "decimal_to_ipv4 ${1:<variable_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Converts a decimal value to an IPv4 address in conventional dotted-quad notation (such as 192.168.0.10).",
    },
    {
      label: "decimal_to_ipv4 as",
      insertText:
        "decimal_to_ipv4 ${1:<source_variable_name>} as ${2:<destination_variable_name>}",
      sortText: "decimal_to_ipv4",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Converts a decimal value to an IPv4 address in conventional dotted-quad notation (such as 192.168.0.10), placing the value in the destination variable.",
    },
    {
      label: "gosub",
      insertText:
        "gosub ${1:<subroutineName>} (${2:<argument1>}, ${3:<argument2>}, ${4:[<argumentN> ...]})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Used to run a named subroutine.",
    },
    {
      label: "ipv4_to_decimal",
      insertText: "ipv4_to_decimal ${1:<variable_name>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Converts an IPv4 address in conventional dotted-quad notation (such as 192.168.0.10) to a decimal value.",
    },
    {
      label: "ipv4_to_decimal as",
      insertText:
        "ipv4_to_decimal ${1:<source_variable_name>} as ${2:<destination_variable_name>}",
      sortText: "ipv4_to_decimal",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Converts an IPv4 address in conventional dotted-quad notation (such as 192.168.0.10) to a decimal value, placing the value in the destination variable.",
    },
    {
      label: "loop",
      insertText:
        "${1:<looplabel>} ${2:[count]} ${3:[timeout timelimit]} {\n\t# Statements\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Executes one or more statements multiple times.",
    },
    {
      label: "lowercase",
      insertText: "lowercase ${1:<variable_name>|{<buffer_name>}}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Sets all letters in a variable or named buffer to lower case.",
    },
    {
      label: "match",
      insertText: "match ${1:<label_name>} ${2:<expression>} ${3:<target>}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Searches either a specified string or the contents of a named buffer using a regular expression.",
    },
    {
      label: "return",
      insertText: "return",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Exits a subroutine at an arbitrary point and returns to the calling location.",
    },
    {
      label: "subroutine",
      insertText: "subroutine ${1:<subroutine_name>} {\n\t# Statements\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Defines a named subroutine.",
    },
    {
      label: "uppercase",
      insertText: "uppercase ${1:<variable_name>|{<buffer_name>}}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Sets all letters in a variable or named buffer to upper case.",
    },
  ];
  return suggestions[item.data];
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
