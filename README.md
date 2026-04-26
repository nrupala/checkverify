# CheckVerify - Verification Links

Generate time-limited verification URLs for credentials and data.

## Features

- **Time-Limited**: 1 hour to 1 year expiry
- **Verification**: Verify tokens instantly
- **Link History**: All generated links saved
- **Export**: Export links as JSON

## Usage

1. Open `index.html` in browser
2. Select link type
3. Enter data
4. Set expiry
5. Click Generate Link
6. Copy or test link

## Expiry Options

- 1 Hour
- 24 Hours (1 day)
- 7 Days
- 30 Days
- 1 Year

## Types

- **Credential**: Verification credential
- **Certificate**: Certificate link
- **Profile**: Profile verification
- **Custom**: Any custom data

## API

```javascript
// Create link
createLink(); // Returns URL

// Verify
verifyLink(); // Checks validity

// Test link
testLink(); // Validates token

// Export
exportLinks(); // JSON export
```

## Token Format

Base64 encoded JSON with:
- `data`: Payload
- `created`: Timestamp
- `expiry`: Expiry timestamp
- `nonce`: Random string

## License

MIT