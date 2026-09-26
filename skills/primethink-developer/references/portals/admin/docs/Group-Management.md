# Group Management

## What Is a Group?

A group in PrimeThink represents a distinct collaborative space with its own set of resources and participants. When you join a group, you become part of a self-contained workspace that includes:

- Your team members and their specific roles within the group
- All conversations and chat histories related to that group's activities
- Documents and resources shared within the group
- Specific settings and preferences for that particular collaborative space
- AI assistants configured for the group's needs

This separation ensures that work, conversations, and resources from one group remain separate from others, maintaining privacy and organizational clarity.

For example, if you're working with multiple teams or clients, each one can have its own group, ensuring that discussions and resources stay properly organized and confidential.

## Group Switcher
For a more detailed description of the group switcher, please refer to the [User Interface guide](/User-Interface/).

## Adding and Creating Groups

Your account can belong to several groups at once, and the group selector lists the ones you've added — with unread badges, and the option to pin the groups you use most.

### Adding a group

1. Open the **group selector** and click **Add groups** (the **+** entry at the bottom of the list).
2. On the **Add groups** screen, enter the email and password of the account that has access to the group, then click **Add groups**.
3. The group selector reappears with the account's groups available — select the ones you want to add.

Use this flow whenever a group already exists (for example, one you've been invited to) but isn't yet listed in the group selector on the device you're using.

### Being added to a group by an administrator

When a Group Admin invites an email address, what happens next depends on whether that address already has an active PrimeThink account:

- **No account yet** — the person is created in an *invited* state and receives an invitation email. They become a member when they accept it.
- **An account already exists** — the person becomes a member of the group straight away. There is nothing to accept, so no invitation email is sent.

In the second case the new member is told with an in-app notification, delivered as a push notification too. Because it is a system notification it is visible from whichever group they happen to be in at the time, and it carries the identity of the new group so that selecting it takes them into it. Without this, someone added to a group would have no way of discovering it existed.

See [Notifications](/Notifications/#where-a-notification-appears) for how system notifications differ from group notifications.

### Creating a new group

1. Open the **group selector** and click **Add groups**.
2. On the **Add groups** screen, click **Create group** (bottom right).
3. Select the **Account** the group should be created with, enter the **Group** name, and click **Create a new group**.

The new group appears in your group selector, with your account as its first member. You can then invite team members and configure roles — see [Roles and Permissions](Roles-and-Permissions.md).

## Embeddings model

Semantic search — indexed collections, document retrieval — depends on an embeddings model, and each group can choose its own. Group Admins set it in **Group Settings → Embeddings → Embeddings Model**, which lists the embedding models the group's configured providers can actually serve. The choice can also be made when the group is created, and through `PUT /api/v1/groups/embeddings_model`; both the settings screen and the endpoint require the **Edit Group Settings** permission. A group that does not choose one keeps whatever the platform default was when the group was created, so a later change to the platform default does not move an existing group's vectors.

```json
PUT /api/v1/groups/embeddings_model
{
  "embeddings_model": "openai:text-embedding-3-large"
}
```

Embedding models are registered separately from chat models, and OpenAI, Google, and Mistral models can be used. The provider's API key setting must be configured for the group in the same way as for chat models — see [Supported LLMs](/Supported-LLMs/).

!!! warning "Choose before you index"
    The vector width of a group's stored embeddings comes from the model you pick, so models with different dimensions are not interchangeable after the fact. The settings screen asks you to confirm the switch, and once the group has indexed content the change is refused — the endpoint answers HTTP 409 and the current model stays in place. Pick the model before indexing anything.

To change the model on a group that has already indexed content, clear the index first:

```
POST /api/v1/groups/embeddings_model/clear_index
```

This drops the group's document and chat vector tables and reports how many it removed, which unlocks the model change. It does not delete any documents or messages, and it keeps memory. Nothing is re-indexed automatically: content that was indexed before stays marked as indexed and simply stops appearing in semantic search until it is indexed again explicitly.

Memory is a separate store, keyed to the platform's memory embeddings model, and is not affected by the group's choice.

## Turning indexing off

A group can switch embeddings and vector indexing off altogether:

```
PUT /api/v1/groups/indexing_active?indexing_active=false
```

This also requires the **Edit Group Settings** permission. With indexing off, uploaded documents are still extracted and analysed and still reach the Ready state — nothing is embedded, so semantic search over them returns nothing and reindexing is refused. Turn it back on when you want retrieval again, remembering that existing content needs to be indexed explicitly.

## User roles and permissions (Group Admin)
PrimeThink uses role-based access control to manage what each user can do within a group. Group Admins can assign roles to users, and each role carries a set of permissions that control access to features such as LLM invocation, direct tool calls, and more.

For full details, see [Roles and Permissions](Roles-and-Permissions.md).
