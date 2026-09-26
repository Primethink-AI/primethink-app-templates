# Settings

The Settings section in PrimeThink provides a comprehensive set of tools for personalizing your experience and managing your account. When you access Settings through the gear icon in the main interface, you'll find a well-organized collection of options divided into distinct categories that help you control various aspects of the platform.

## Navigation and Organization

The Settings interface is organized into three main tabs at the top of the screen: User, User Variables, and Group Variables. This thoughtful organization helps you quickly find the settings you need while maintaining a clear separation between personal preferences and group-level configurations.

## User Settings

The User tab contains all your personal account settings and preferences. This section is where you manage your identity and basic interaction preferences within PrimeThink.

### Profile Information
Your profile settings include several key pieces of information that identify you within the platform:

The First Name and Last Name fields allow you to set how you'll appear to other users. Each field has an edit button (pencil icon) that lets you modify your information when needed.

Your Email address is an important identifier that's used for account management and notifications. Like other profile fields, it can be updated using the edit button when necessary.

The Username field displays your unique identifier in the system. This name is used across the platform to distinguish you from other users.

### Connected accounts

If your group has a Telegram bot or Slack app set up, **Connected accounts** lets you link your own Telegram or Slack identity to your PrimeThink account, so the assistant recognises you when you write from there. Connecting opens a dialog with a link to tap, a QR code to scan, and a one-time code to copy; it closes by itself once the link is complete. **Disconnect** unlinks the platform again. The section is not shown when the group has no channels.

Once your account is connected, a chat's **Settings → Connections** lets you attach a Telegram group, your Telegram DM, or a Slack channel to that chat. See [Channels](/admin/Channels/) for how conversations and chats fit together.

A Profile Image helps others identify you visually in conversations and group settings. You can either upload a custom image or use the default initials display (shown as "TT" in the example).

The Change Password option allows you to update your security credentials when needed. This is an important feature for maintaining account security.

### Message Preferences
Below your profile information, you'll find several options that control how you interact with messages:

"Always translate speech to English" automatically converts voice input to English text, making communication more accessible across language barriers.

"Send the speech immediately" determines whether voice input is sent right away or waits for your confirmation.

"Speech-to-Text Mode" controls how the microphone button behaves when you dictate a message. Four modes are available:

- **Press to start / Press again to send** — Tap the mic button once to start recording, then tap it again to stop and send. Best for longer dictations where holding the button isn't comfortable.
- **Push, Speak, Release to send** — Classic push-to-talk. Hold the mic button while speaking and release to send. Best for short messages and noisy environments where you want strict control over when the mic is open.
- **Freehands** — Hands-free mode. The microphone listens continuously and uses voice activity detection to determine when you've finished speaking, then sends automatically. No button presses are needed during a conversation.
- **Realtime (ElevenLabs)** — Streaming transcription powered by ElevenLabs Scribe v2. Audio is transcribed live as you speak so text appears in near real-time rather than after you stop. Offers the best accuracy and lowest perceived latency.

### Voice Mode

**Voice Mode** turns a conversation hands-free. It can be switched on from the user menu in the sidebar, from the Messages section of Settings, or with `⌥ V`, and the choice is remembered.

While it is on:

- A dictated message is sent as soon as you stop recording, without a review step — "Send the speech immediately" is shown as forced on for the duration.
- **The assistant decides what you hear.** Rather than reading the written reply out in full, it speaks short spoken summaries as it works, so the audio can start while the text is still arriving, and it may decide a turn needs nothing said at all. Audio Replies is therefore shown as inactive with a "Not used in Voice Mode" note; the Play button on an individual message still works, since that is an explicit request.
- Clips are played in the order they arrive, in the responding agent's configured voice, and only for the chat you are looking at. Cancelling a reply, or turning Voice Mode off mid-answer, stops the playback and drops anything still queued.

Voice Mode does not apply to Live App chats or public shared chats.

## User Interface Preferences

Under the User Interface section, you can customize how PrimeThink looks and behaves:

The "Use bubbles in chat" option determines the visual style of message display in your conversations. When enabled, messages appear in distinctive bubble containers that help separate different pieces of communication. When disabled, the chat uses the compact layout instead, which groups consecutive messages from the same sender and shows a time beside each one — see [Chat Display](User-Interface.md#chat-display).

The "Default Virtual Assistant" setting lets you choose which AI assistant will be your primary helper. This selection affects which assistant automatically responds when you start new conversations.

The Theme selector offers three options for visual appearance:
- Light: A bright theme suitable for well-lit environments
- Dark: A darker theme that reduces eye strain in low-light conditions
- System: Automatically matches your device's theme settings

## Group Settings

When managing a group, you'll find additional options that help you customize the group experience:

The Group Code is a unique identifier that others can use to join your group. This code is automatically generated but can be customized if needed.

The Public Group Name is what others see when they interact with your group. You can edit this name to better reflect your group's purpose or organization.

The Group Image, like your profile image, helps identify your group visually in the interface. You can upload a custom image that represents your group's identity.

## Variables Management

Both User Variables and Group Variables tabs provide powerful customization options:

### User Variables
These are personal settings that affect your individual experience. When you click the "+" button, you can create new variables with custom names and values, allowing you to store preferences or information that can be used across different features.

### Group Variables
Similar to user variables, but these affect the entire group's experience. Group administrators can create and manage these variables to establish consistent behavior across the group.

These variables are also what capabilities and tool plugins read at runtime through `${SETTING_NAME}` placeholders. For a consolidated list of every setting the platform's documented features expect — and where each is used — see the [Extra Settings Reference](/admin/Extra-Settings/).

## Advanced Options

At the bottom of the settings interface, you'll find several important system-level options:

The App Version information helps you stay aware of your current software version, which is important for troubleshooting and support.

The Logout option signs you out of the group you are currently in; if that is the only group left, it signs you out completely, and otherwise it asks which group to carry on in. **Log out from groups** lets you pick any combination of the groups you are signed in to — the ones you do not select stay signed in — or sign out of all of them at once, which is a useful security feature when using shared devices.

**Log out of all devices** goes further: after you confirm, every session belonging to your account ends, on this device and on any phone, tablet, or browser you have signed in from. Use it if you think a device has been lost or a session may have been used by someone else.

## Best Practices for Settings Management

When configuring your settings, consider these recommendations:

Take time to review all available options when you first set up your account. Understanding what's available helps you optimize your experience from the start.

Regularly review and update your settings as your needs change. What works well at first might need adjustment as you use different features or join new groups.

Keep your profile information current to help other users identify and communicate with you effectively.

Consider your privacy needs when configuring sharing and visibility options. PrimeThink provides various controls to help you maintain your preferred level of privacy.

The settings section is designed to give you fine-grained control over your PrimeThink experience while remaining approachable and easy to understand. As you become more familiar with these options, you'll be able to customize the platform to better suit your specific needs and preferences.
