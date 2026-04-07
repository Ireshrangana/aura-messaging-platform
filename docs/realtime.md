# Realtime Messaging Behavior

## Channels

- `presence:user:{id}`
- `chat:{id}:messages`
- `chat:{id}:typing`
- `chat:{id}:reads`
- `chat:{id}:reactions`
- `story:{userId}:updates`
- `security:{userId}:sessions`

## Event examples

- `message.created`
- `message.updated`
- `message.deleted`
- `message.read`
- `message.reaction.added`
- `presence.changed`
- `typing.started`
- `typing.stopped`
- `device.login.detected`
- `report.flagged`

