# [Bitly](https://bitly.com/) Android Client in [React Native](https://facebook.github.io/react-native/)

## Development

### 1. Install react-native-cli

```bash
$ npm install -g react-native-cli
```

### 2. Install rnpm

```bash
$ npm install -g rnpm
```

### 3. Create a secrets.js file

Copy the `secrets.js.sample` file to `secrets.js` and replace the ClientId and ClientSecret values.

```javascript
var Secrets = {
  ClientId: "YOUR_BITLY_CLIENT_ID",
  ClientSecret: "YOUR_BITLY_CLIENT_SECRET"
};

module.exports = Secrets;
```

### 4. Run React Native

```bash
$ react-native run-android
```
