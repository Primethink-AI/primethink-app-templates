# Read Content of URL

The **Read Content of URL** tool lets your assistant fetch a web address and work with whatever is there — a web page, a plain-text or data file, or a downloadable document. It's one of the core `base` tools, so it's available to almost every agent.

## What it does

When you give your assistant a link, it fetches the address and figures out what kind of content it found:

- A **web page** → it pulls out the main content as clean, readable text (skipping menus, ads, and boilerplate).
- A **text or data file** (plain text, Markdown, JSON, XML, and similar) → it hands you the content exactly as written, untouched.
- A **file you'd normally download** (PDF, image, Word or Excel document, ZIP, and so on) → it can save the file into your chat as a document and start extracting its text, provided you asked for it to be saved and gave it a name.

## How to use it

Just share a link and tell your assistant what you want:

```
"Read https://example.com/blog/post and give me a 5-bullet summary."
```

```
"Fetch this release notes page and tell me what changed since version 2.0."
```

```
"Download the PDF at https://example.com/report.pdf and pull out the key figures."
```

You don't need to specify the tool or the content type — the assistant recognizes the link and handles the rest.

## What happens with different kinds of content

The tool adapts to whatever it finds at the address:

| You point it at… | What you get |
|------------------|--------------|
| A web page (HTML) | The main article/content as readable text, returned in the chat. |
| A plain-text, Markdown, JSON, or XML file | The content returned exactly as-is — nothing reformatted or stripped. |
| A downloadable file (PDF, image, DOCX, XLSX, ZIP, …) | Nothing to read inline, so the assistant tells you it needs a destination folder and a filename before it can save it. Once you ask it to save, the file becomes a chat document with text extraction started automatically. |

!!! tip "Why text files come back untouched"
    Returning text and data files verbatim means pages like `llms.txt`, raw Markdown, or API responses arrive intact — exactly as the source published them, with no web-page cleanup applied.

## Saving what it fetched

Reading is the default: nothing is stored unless you ask for it. To keep the result, say where it should go **and** what it should be called — the assistant needs both a destination folder and a filename before it will save anything, and it stores the file under exactly the name you give:

```
"Read https://example.com/guide and save it into the 'Research' folder as guide.html."
```

```
"Download the PDF at https://example.com/report.pdf into 'Reports' as annual-report.pdf."
```

If you leave out the filename, the assistant reads the page and returns the text without saving; a binary file it cannot show inline is simply reported back, so you can decide on a name.

When you save a **web page**, you get two documents: the original page and a cleaned-up, readable copy. For a **text or downloadable file**, the original is saved as-is.

## Keeping or dropping images

When reading a web page, the assistant can keep image references in the extracted text or leave them out. Images are kept by default; if you only want the words, just say so:

```
"Read this page but skip the images — text only."
```

## When a site blocks the assistant

Most of the web is fetched directly, which is fast and costs nothing. Some sites refuse it — large retailers and marketplaces in particular routinely block automated requests, and some pages are built entirely in the browser, so fetching the address yields a shell with no readable text in it.

When that happens, the tool can hand the address to a **hosted page fetcher** that specialises in retrieving and extracting such pages. This is off until your group configures one:

| Setting | Values | Default |
|---------|--------|---------|
| `WEB_FETCH_PROVIDER` | `Auto`, `Tavily`, `Firecrawl`, `Jina`, `Serper`, or `None` | `Auto` |
| `WEB_FETCH_STRATEGY` | `fallback` or `always` | `fallback` |

- **`Auto`** uses the first provider you have configured a key for, trying Tavily, then Firecrawl, then Jina, then Serper. With no key configured, nothing is used and fetching stays direct-only. Choosing a provider explicitly uses that one.
- **`None`** never calls a hosted provider, whatever keys exist.
- **`fallback`** — the default — only calls the provider when the direct fetch was blocked or returned a page with nothing readable in it. **`always`** calls the provider first and falls back to the direct fetch, which buys better extraction on every page at a per-call cost.

Keys go in your variables like any other credential (see [Extra Settings](Extra-Settings.md)): `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `JINA_API_KEY`, `SERPER_API_KEY`. Tavily's and Serper's keys are the same ones used for [web search](Internal-Capabilities.md). Jina works without a key, at a lower rate limit, if you select it explicitly. `WEB_FETCH_USER_AGENT` overrides how the direct fetch identifies itself.

!!! note "A hosted fetcher means sending the address to a third party"
    Configuring a provider means the URLs it is asked to fetch — and the content it returns — pass through that provider. Addresses that are not publicly routable are **never** sent to one; they are refused outright, as described below. Choose a provider you are content to share browsing targets with, and prefer `fallback` over `always` so that only the pages the direct fetch could not handle leave your deployment.

!!! tip "If the assistant reports that a page could not be read"
    Errors now say what actually went wrong — the HTTP status that came back, a timeout, a certificate failure, or too many redirects — rather than failing opaquely. A retail or marketplace page that reports a refusal is the case a hosted fetcher is for; without one configured, retrying will keep failing.

## Reading a very long page

A page longer than the tool can return in one go is delivered in sections rather than being silently cut short. The assistant can ask for the next section by offset and continue where it left off, so a long reference page or article can be read through to the end. You do not have to manage this — ask for the rest and the assistant continues.

## Good to know

- **Public web addresses only.** The tool accepts `http://` and `https://` URLs that resolve to a publicly routable address. Loopback, private-network, link-local, and cloud-metadata addresses are refused, redirects are re-checked at every hop and limited to five, and `file://` URLs or bare filesystem paths are rejected. To work with a file that is already in the chat, ask the assistant to read the document rather than fetch a URL for it.
- **Saving a file needs an active chat.** Documents are saved into your current conversation. If the assistant is working outside of a chat, it can still read web pages and text, but it can't save a file.
- **Very large or slow downloads may time out.** The tool fetches quickly; an extremely large file or a slow server may not finish in time.
- **Saved files are processed automatically.** Once a document lands in your chat, text extraction runs in the background. See [Supported Document Formats](/Supported-Document-Formats/) for what can be extracted.

## Related Topics

- [Internal Tools](Internal-Tools.md) — overview of the assistant's built-in tools
- [Internal Capabilities](Internal-Capabilities.md) — the `base` capability that provides this tool
- [Documents & Collections](/Documents-and-Collections-in-Chats/) — working with files saved in a chat
- [Supported Document Formats](/Supported-Document-Formats/) — which file types can be read and extracted
