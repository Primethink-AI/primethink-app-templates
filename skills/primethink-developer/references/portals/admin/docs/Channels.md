# Channels: Telegram and Slack

A **channel** bridges an external messaging platform into PrimeThink, so a conversation in Telegram or Slack is answered by one of your group's agents. Each group brings its own bot: you register it once, and members then connect their own accounts and attach their own chats.

There are three things to keep apart:

| Thing | Who sets it up | Where |
|-------|----------------|-------|
| **Channel** | Group Admin | Group Settings — a Telegram bot or Slack app owned by the group, with an agent, a reply mode, and a live status |
| **Connected account** | each member | User Settings — the member's own Telegram or Slack identity |
| **Connection** | each member | a chat's Settings — a Telegram group/DM or Slack channel/DM attached to that chat |

Registering a channel requires the **Edit Group Settings** permission, which Group Admins hold by default and which can be granted to a custom role. *Using* a registered channel is not permission-gated: any member can connect their account and attach chats they belong to.

## Managing channels in the app

Group Admins do all of this from **Group Settings → Channels**, which lists the group's channels with a live status chip and warns with a banner when the background worker that runs the agents is not healthy.

**Add channel** walks through four steps: pick the platform, paste the credentials and press **Verify**, choose the agent and the reply mode, and finish — with the bot's link for Telegram, or the remaining Slack setup for Slack.

Each channel's menu offers **Edit**, **Finish Slack setup**, **Re-bind webhook** (for a channel reporting a mismatch), **Replace token(s)**, **Copy bot link**, **Pause**/**Resume**, and **Remove**. Pausing leaves the channel configured but stops it serving messages.

The rest of this page describes the same operations through the API, which is what to use for automation.

## Reply mode

Every channel has a mode that decides which conversations it serves:

- **Reply to everyone** — the bot answers any conversation it is part of, creating a PrimeThink chat for a conversation it has not seen before. A sender who has no PrimeThink account is greeted once and served as a guest.
- **Connected chats only** — the bot serves only conversations that a member has explicitly attached to a chat. An unknown sender is told how to connect their account instead of being answered, at most once every ten minutes.

In a group or channel, the bot replies when it is @-mentioned or replied to, when the conversation is a direct message, or when it is alone with a single human. Otherwise it stays silent, so it does not talk over a busy channel.

## Registering a Telegram bot

1. Create the bot with Telegram's **BotFather** (`/newbot`) and keep the token. If it should also read messages in groups that do not mention it, set `/setprivacy` to *Disable*.
2. Validate the token without saving anything:

    ```bash
    curl -X POST "$BASE_API_URL/api/v1/channels/configs/test" \
      -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
      -d '{"source":"telegram","credentials":{"bot_token":"123456:ABC..."}}'
    ```

3. Create the channel, choosing the agent that will answer and the reply mode:

    ```bash
    curl -X POST "$BASE_API_URL/api/v1/channels/configs" \
      -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
      -d '{"source":"telegram","credentials":{"bot_token":"123456:ABC..."},
           "virtual_assistant_id":42,"mirror_enabled":true,"display_name":"Acme Assistant"}'
    ```

    The agent must belong to the same group. `mirror_enabled: true` is *Reply to everyone*; `false` is *Connected chats only*.

4. Message the bot, or add it to a group and mention it.

The response carries the bot's link, its label, the agent's name, and a status — but never the token. There is no separate bot process to run: channels live inside the platform and come back on their own after a restart.

## Registering a Slack app

Each PrimeThink installation and group uses its own Slack app.

1. Fetch a creation manifest from `GET /api/v1/channels/slack/manifest?bot_name=Acme%20Assistant` and create the app from it at [api.slack.com/apps](https://api.slack.com/apps?new_app=1), then install it to your workspace.
2. Create the channel with the **Bot User OAuth Token** and the **Signing Secret**:

    ```json
    {"source": "slack", "credentials": {"bot_token": "xoxb-...", "signing_secret": "..."}}
    ```

3. Slack cannot be pointed at a URL through its API, so bind it by hand: paste the manifest from `GET /api/v1/channels/configs/{id}/slack-manifest` — which already contains this channel's request URL, its event subscriptions, and the `/pt` command — into the app's *App Manifest* page and save.

Until Slack completes its handshake, the channel reports **Waiting for Slack**; it becomes **Active** on the first signed request.

!!! warning "Reinstall an older Slack app to get file uploads"
    Sending files into a Slack conversation needs the `files:write` scope, which is part of the current manifest. A Slack app created before that scope was added keeps answering with text, but its file uploads fail. Re-paste the current manifest and reinstall the app to enable them.

## Watching a channel's health

Every channel reports a status: `active`, `awaiting_verification`, `webhook_mismatch`, `credentials_invalid`, `paused`, or `unknown`, together with when it last saw traffic. A mismatch — usually a bot whose platform binding drifted — is repaired with `POST /api/v1/channels/configs/{id}/rebind`.

`GET /api/v1/channels/health` reports whether the background worker that runs the agents is alive. If it is not, channels accept messages but nothing answers them, so check this first when a bot goes quiet.

## Connecting an account and attaching a chat

All linking runs on one-time codes minted by the app for a signed-in member, so ownership is proven by the login rather than by an email typed into a bot. Codes look like `XXXX-XXXX`, work once, and expire after 15 minutes.

- **Connect your account** — in **User Settings → Connected accounts**, each platform the group has a channel for offers **Connect** and **Disconnect**. Connect opens a dialog with a deep link to tap, a QR code, the code itself, and a countdown; it closes by itself once the link completes. On Slack, send the code as `/pt link <code>`. An identity currently held by a guest account is moved to you; one already held by another member is refused.
- **Attach a conversation to a chat** — a chat's **Settings → Connections** lists what the chat is attached to, who connected it, and when, and offers to connect a Telegram group, your Telegram DM, or a Slack channel, as well as to disconnect. Redeeming the code attaches the conversation, and links your platform account at the same time if it was not linked yet.

Both sections are hidden when the group has no channels, and Connections does not appear on direct chats.

A conversation can be attached to at most one chat per channel, and a chat to at most one conversation per channel.

## Commands inside the conversation

| Purpose | Telegram | Slack |
|---------|----------|-------|
| Attach this conversation to a chat | `/join_chat [name]` | `/pt connect [name \| number \| code]` |
| Run a task and attach its chat | `/join_task <task> [message]` | `/pt task <task> [message]` |
| Detach | `/leave` | `/pt disconnect` |
| Connect my account | `/start <code>`, `/link <code>` | `/pt link <code>` |
| Who am I, what is this attached to | `/status` | `/pt status` |
| Help | `/help` | `/pt help` |

The same commands also work typed as plain text with a `!` prefix, for example `!join-chat`. With no argument, the attach command offers a picker of your recent chats — an inline keyboard on Telegram, a numbered list on Slack — so nobody has to type an identifier. With a name, it searches the chats you are a member of.

Attaching or detaching requires a connected account, membership of the group, and membership of the target chat, exactly as the API requires for writing to a chat. When a command is refused, the reply says what to do next.

## What to expect from a channel conversation

- **The conversation lives on the platform.** There is no outbound path from a PrimeThink chat to Telegram or Slack: you write in the connected group, DM, or channel, and everything said there is mirrored into the chat. A connected chat therefore replaces its message composer with a notice naming where to write, and disconnecting from the chat's Connections panel brings the composer straight back.
- **Replies arrive whole, not streamed.** Telegram shows a typing indicator; Slack reacts with an hourglass and swaps it for a check mark when it is done. If an answer takes longer than 45 seconds the bot says it is still working and posts the answer when the job finishes, up to a four-minute ceiling.
- **Formatting is translated to the platform.** The assistant answers in Markdown, and each channel converts it into what that platform understands: Telegram's HTML subset, Slack's mrkdwn. Bold, italic, strikethrough, inline code, code blocks, links, and quotes survive. What a platform has no equivalent for degrades to something readable instead of leaking markup — headings become bold, list items become bulleted or numbered lines with indentation, and a table becomes one line per row. If a platform rejects a rendered message, the bot sends it as plain text rather than failing.
- **Long answers are split** into several messages at paragraph or line boundaries, and each part is formatted on its own so no styling is left dangling across messages.
- **Slack threads are remembered**, so a follow-up inside a thread the bot replied in counts as addressed without another mention.
- **Photos and files sent to a Telegram bot reach the agent.** A photo or a document attached to a message is stored as a chat document and handed to the agent with the message, so it can look at an image or read a PDF. The caption is the text of the turn; a photo sent without a caption still gets answered, with a short stand-in prompt in place of the missing text. Telegram's Bot API caps a download at 20 MB, and anything larger is refused with a note rather than silently dropped. In a group the bot's reply rules are applied first, so an attachment in a conversation the bot would not answer is never downloaded at all — @-mention the bot in the caption to address it.
- **Files the assistant produces are delivered to the conversation.** When an answer comes with attachments — the spreadsheet it built, the calendar invite it generated — they are sent after the text, because someone working in Telegram or Slack cannot open the chat's documents. Telegram shows images inline as photos and sends everything else as a file; Slack uploads them into the same thread as the reply. Up to ten attachments per answer are sent, and one file that cannot be delivered does not stop the others. Anything above the platform's own upload limit is skipped, with the text reply unaffected.
- **Telegram voice notes** are transcribed as soon as they arrive. The bot echoes the transcript back and asks whether you want the answer as **Text** or **Voice**, so a bad transcription is caught before it is answered. The choice stays available for ten minutes; after that, or once the note has been answered, the bot says so and asks you to send it again. Tapping twice does not answer twice.

## Related Topics

- [Group Management](Group-Management.md) — where channels are configured
- [Roles and Permissions](Roles-and-Permissions.md) — the Edit Group Settings permission
- [Agents](Agents.md) — choosing the agent that answers a channel
