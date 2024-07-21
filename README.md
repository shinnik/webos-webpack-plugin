# About

webos-webpack-plugin is a plugin for Webpack created to simplify packaging of WebOS Basic Applications (aka Packaged Applications) and makes it easier to embed packaging into your JS bundling process. It automatically generates required assets such as appinfo.json, copies icons and scripts to the destination folder and packages them into standard .ipk

It leverages official [ares-cli](https://github.com/webosose/ares-cli/) under the hood and can help to avoid installing it globally, if your goal is to package an application from your source code.

# Example
First, import plugin

```javascript
const { WebOSWebpackPlugin } = require("webos-webpack-plugin");
```

Then add a plugin into plugin section of your Webpack config:

```javascript
plugins: [
    // your other plugins here
    new WebOSWebpackPlugin({
        appInfo: {
             id: "com.company.app.example-name",
             title: "My App",
             type: "web",
             icon: path.resolve(__dirname, "icon.png"),
             splashBackground: path.resolve(__dirname, "bootScreen.png"),
             largeIcon: path.resolve(__dirname, "./public/largeIcon.png"),
             main: "index.js",
             version: "1.0.1",
        },
        preserveSrc: true,
    })
]
```

If there are no errors, you will see the ipk file such as `com.company.app.example-name_1.0.1_all.ipk` in the build folder when build your app with Webpack

appInfo object contains all possible parameters from [WebOS OSE documentation](https://www.webosose.org/docs/guides/development/configuration-files/appinfo-json/)

`preserveSrc: false` allows to clean up the build directory from other assets and leaves only .ipk file inside.